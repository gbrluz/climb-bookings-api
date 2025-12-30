import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // Permite qualquer origem para teste local
    methods: ['GET', 'POST'],
  }
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Quando um clube se conecta, ele entra em uma sala exclusiva
  handleConnection(client: Socket) {
    console.log('🔌 Tentativa de conexão detectada!');
    const clubId = client.handshake.query.clubId;
    const userId = client.handshake.query.userId;

    if (clubId) {
      client.join(`club_${clubId}`);
      console.log(`♣️ Clube conectado: ${clubId}`);
    }

    if (userId) {
    client.join(`user_${userId}`);
    console.log(`🎾 Jogador conectado: ${userId}`);
  }
  }

  handleDisconnect(client: Socket) {
    console.log('🔌 Cliente desconectado');
  }

  // Método para enviar o leilão apenas para os clubes interessados
  sendAuctionToClub(clubId: string, auctionData: any) {
    this.server.to(`club_${clubId}`).emit('new_auction', auctionData);
  }

  sendAuctionConfirmedToPlayer(userId: string, reservationData: any) {
  // O servidor envia para a sala do usuário (que deve entrar nela ao conectar)
  this.server.to(`user_${userId}`).emit('auction_confirmed', {
    message: 'Sua partida foi confirmada por um clube!',
    data: reservationData,
  });
}
}