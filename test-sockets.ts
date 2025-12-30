import { io } from 'socket.io-client';
import axios from 'axios';

const API_URL = 'http://localhost:3000';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsImtpZCI6IlRJcWVlUnM3eitqa3pJTEYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FtYnl6cHVwZ3Riemt6bXl5bmVoLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI2NDBmODEwZi1iNGJmLTQyNGItYmRiMy0yMDczYzNhYTIzYWQiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzY3MTI1NTI4LCJpYXQiOjE3NjcxMjE5MjgsImVtYWlsIjoidGVzdGVAY2xpbWIuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbF92ZXJpZmllZCI6dHJ1ZX0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NjcxMjE5Mjh9XSwic2Vzc2lvbl9pZCI6ImRjOTk3Mjg5LTBhZGEtNDU5ZS04NzcxLWYwNzQ4NDNiNDI4MSIsImlzX2Fub255bW91cyI6ZmFsc2V9.bPOkkDy-2v-VTKRMA-NFWt0-cB4TkqZhTPVUMJigo7Y'; // O mesmo que você usou para passar o 401

async function testCompleteFlow() {
  const clubId = '4576b1a6-618a-4158-bc36-fc2783435bcf'; // ID do seu log
  const userId = '01486a23-2362-456b-9851-21f6032c8a5e';
  const courtId = 'b54a5b05-7935-4d52-be73-5402a098d2f0'; // Precisa existir no Supabase

  const clubSocket = io(API_URL, { query: { clubId } });
  const playerSocket = io(API_URL, { query: { userId } });

  // PASSO 2: Clube recebe e ACEITA
  clubSocket.on('new_auction', async (auction) => {
    console.log('📢 Clube recebeu o leilão! Aceitando agora...');
    
  });

  // PASSO 3: Jogador recebe a confirmação final
  playerSocket.on('auction_confirmed', (payload) => {
    console.log('🎉 SUCESSO! Jogador recebeu a confirmação via Socket:', payload.message);
    console.log('📅 Detalhes da Reserva:', payload.data);
    process.exit(0);
  });

  // PASSO 1: Jogador cria o pedido
  setTimeout(async () => {
    console.log('📝 Jogador criando pedido de leilão...');
    await axios.post(`${API_URL}/auction/create`, {
      id: `auction_${Date.now()}`,
      city: 'Santo Angelo',
      lat: -28.2992, // Adicione isso
      lon: -54.2631, // Adicione isso
      players: [userId],
      date: '2025-12-30',
      time: '18:00:00'
    }, {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
    });
  }, 2000);
}

testCompleteFlow();