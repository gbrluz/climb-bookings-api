export interface AuctionRequest {
  id: string;
  players: string[];     // IDs dos jogadores (do seu sistema de ranking)
  city: string;          // Para filtrar quais clubes recebem a notificação
  date: string;          // Formato YYYY-MM-DD
  time: string;          // Formato HH:MM
  category: string;      // Ex: '4th Category'
  status: 'open' | 'claimed' | 'expired';
  targetClubId: string;
}

export interface ClaimResponse {
  success: boolean;
  reservationId?: string;
  message: string;
}