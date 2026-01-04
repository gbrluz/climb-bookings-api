import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class WebSocketService implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const clubId = client.handshake.query.clubId as string;
    const userId = client.handshake.query.userId as string;

    if (clubId) {
      client.join(`club_${clubId}`);
      console.log(`♣️ Club connected: ${clubId}`);
    }

    if (userId) {
      client.join(`user_${userId}`);
      console.log(`🎾 Player connected: ${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`🔌 Client disconnected: ${client.id}`);
  }

  // Send auction to specific club
  sendAuctionToClub(clubId: string, auctionData: any): void {
    this.server.to(`club_${clubId}`).emit('new_auction', auctionData);
  }

  // Send auction confirmation to player
  sendAuctionConfirmedToPlayer(userId: string, reservationData: any): void {
    this.server.to(`user_${userId}`).emit('auction_confirmed', {
      message: 'Your match has been confirmed by a club!',
      data: reservationData,
    });
  }

  // Send new booking notification to club
  sendNewBookingToClub(clubId: string, bookingData: any): void {
    this.server.to(`club_${clubId}`).emit('new_booking', bookingData);
  }

  // Generic method to emit to a room
  emitToRoom(room: string, event: string, data: any): void {
    this.server.to(room).emit(event, data);
  }

  // Generic method to emit to all clients
  emitToAll(event: string, data: any): void {
    this.server.emit(event, data);
  }
}
