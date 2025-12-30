import { Injectable, BadRequestException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NotificationsService } from '../notifications/notifications.service';
import { AuctionRequest, ClaimResponse } from './interfaces/auction.interface';
import Redis from 'ioredis';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AuctionService {
  private supabase: SupabaseClient;
  private redis: Redis;

  constructor(
    private readonly notificationsService: NotificationsService,
    private notificationsGateway: NotificationsGateway,
  ) {
    this.supabase = createClient(process.env.SUPABASE_URL  || '', process.env.SUPABASE_SERVICE_ROLE_KEY  || '');
    this.redis = new Redis(process.env.REDIS_URL  || 'redis://localhost:6379'); // Configuração do seu Redis (ex: Upstash ou Docker)
  }

  // 1. Jogadores criam um pedido de jogo sem quadra
  async createAuctionRequest(
  data: AuctionRequest, 
  playerLat: number, 
  playerLon: number
): Promise<AuctionRequest> {
  try {
    // 1. Busca clubes num raio de 10km (10.000 metros) usando a função RPC que criamos no Supabase
    // O RPC 'get_nearby_clubs' utiliza o PostGIS para calcular a distância geográfica
    const { data: nearbyClubs, error: geoError } = await this.supabase.rpc('get_nearby_clubs', {
      lat: playerLat,
      lon: playerLon,
      radius_meters: 10000 // Raio de 10km
    });

    if (geoError) {
      console.error('❌ Erro na busca geográfica:', geoError.message);
      throw new InternalServerErrorException('Erro ao localizar clubes próximos');
    }

    // 2. Se não houver clubes próximos, avisamos o jogador imediatamente
    if (!nearbyClubs || nearbyClubs.length === 0) {
      throw new BadRequestException('Nenhum clube encontrado nesta região no momento.');
    }

    // 3. Salva o leilão no Redis com expiração de 2 horas (7200 segundos)
    const redisKey = `auction:${data.id}`;
    await this.redis.set(redisKey, JSON.stringify(data), 'EX', 7200);

    // 4. Notifica EM TEMPO REAL apenas os clubes que estão no raio de alcance
    nearbyClubs.forEach((club: any) => {
      this.notificationsGateway.sendAuctionToClub(club.id, data);
    });

    // 5. Opcional: Dispara notificação push para os donos desses clubes específicos
    await this.notificationsService.sendPushToClubOwners(
      data.city,
      'Novo Leilão por Perto!',
      `Um grupo quer jogar no dia ${data.date} às ${data.time}. Aceite antes dos outros clubes!`
    );

    console.log(`🚀 Leilão ${data.id} enviado para ${nearbyClubs.length} clubes próximos.`);
    return data;

  } catch (error) {
    if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
      throw error;
    }
    throw new InternalServerErrorException('Erro crítico ao processar pedido de leilão');
  }
}

  // 2. Clube tenta aceitar o leilão
  async claimAuction(auctionId: string, clubId: string, courtId: string): Promise<ClaimResponse> {
    const redisKey = `auction:${auctionId}`;
    const lockKey = `lock:${auctionId}`;

    // A operação 'setnx' (Set if Not Exists) é a chave do leilão.
    // Ela tenta criar a chave 'lock'. Se já existir, retorna 0 (falha).
    const acquiredLock = await this.redis.setnx(lockKey, clubId);
    
    if (!acquiredLock) {
      throw new ConflictException('Esta partida já foi aceita por outro clube!');
    }

    // Definimos um tempo de vida para a trava (ex: 30s) para não travar o sistema em caso de erro
    await this.redis.expire(lockKey, 30);

    // Busca os dados do leilão que estavam "na nuvem" do Redis
    const auctionDataRaw = await this.redis.get(redisKey);
    if (!auctionDataRaw) {
      await this.redis.del(lockKey); // Libera o cadeado se o leilão expirou
      throw new BadRequestException('O leilão expirou ou não existe mais.');
    }

    const auctionData: AuctionRequest = JSON.parse(auctionDataRaw);

    // Transforma o Leilão em uma Reserva Real no PostgreSQL
    const { data: reservation, error: pgError } = await this.supabase
      .from('reservations')
      .insert([{
        court_id: courtId,
        user_id: auctionData.players[0], // O líder do grupo
        booking_date: auctionData.date,
        start_time: auctionData.time,
        end_time: this.calculateEndTime(auctionData.time, 90), // Padrão 90 min
        status: 'confirmed',
        amount_paid: 0 // Pagamento pode ser feito no clube ou via app depois
      }])
      .select()
      .single();

    if (pgError) {
      await this.redis.del(lockKey); // Se o banco falhar, libera para outro clube tentar
      throw new InternalServerErrorException(`Erro ao persistir no banco: ${pgError.message}`);
    }
    // Notifica o jogador que seu jogo foi confirmado
    this.notificationsGateway.sendAuctionConfirmedToPlayer(
    auctionData.players[0], // ID do líder do grupo
    reservation
    );

    // Sucesso! Removemos o leilão e a trava do Redis
    await this.redis.del(redisKey);
    await this.redis.del(lockKey);

    return {
      success: true,
      reservationId: reservation.id,
      message: 'Partida confirmada com sucesso no seu clube!'
    };
  }

  private calculateEndTime(startTime: string, minutes: number): string {
    const [h, m] = startTime.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m + minutes);
    return date.toTimeString().split(' ')[0];
  }

  @Cron(CronExpression.EVERY_MINUTE)
async handleExpiredAuctions() {
  
  // 1. Você pode buscar chaves que combinem com o padrão 'auction:*'
  const keys = await this.redis.keys('auction:*');
  
  for (const key of keys) {
    const dataRaw = await this.redis.get(key);
    if (!dataRaw) continue;

    const auction: AuctionRequest = JSON.parse(dataRaw);
    
    // Lógica opcional: Se o leilão foi criado há mais de 15 min e ninguém aceitou
    // Você pode enviar uma notificação de "Nenhum clube disponível" e deletar.
    
    // Exemplo de log para monitoramento
    console.log(`Leilão ainda ativo: ${auction.id}`);
  }
}
}