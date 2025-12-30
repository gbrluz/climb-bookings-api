import axios from 'axios';

// Substitua pelo seu Token JWT real que você pega no Frontend (Supabase Auth)
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsImtpZCI6IlRJcWVlUnM3eitqa3pJTEYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FtYnl6cHVwZ3Riemt6bXl5bmVoLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI2NDBmODEwZi1iNGJmLTQyNGItYmRiMy0yMDczYzNhYTIzYWQiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzY3MTEyNjQ2LCJpYXQiOjE3NjcxMDkwNDYsImVtYWlsIjoidGVzdGVAY2xpbWIuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbF92ZXJpZmllZCI6dHJ1ZX0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NjcxMDkwNDZ9XSwic2Vzc2lvbl9pZCI6ImFiZDNkNWJjLTYyYzEtNDNjMC1hYzRjLWE1NTI0YzdiYjcxYiIsImlzX2Fub255bW91cyI6ZmFsc2V9.9V2RubQ1M4X2NUrz4d9usFplT0BmhOvZgf5vofuTIuU'; 
const API_URL = 'http://127.0.0.1:3000/auction';

async function runTest() {
  console.log('🏁 Iniciando Teste de Leilão com Redis...');

  try {
    // 1. Simula a criação de um pedido de leilão
    const auctionReq = await axios.post(`${API_URL}/request`, {
      players: ['01486a23-2362-456b-9851-21f6032c8a5e'],
      city: 'Sao Paulo',
      date: '2024-12-30',
      time: '18:00',
      category: '4ª Categoria'
    }, {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
    });

    const auctionId = auctionReq.data.id;
    console.log(`✅ Leilão criado no Redis: ${auctionId}`);

    // 2. Simula o "Race Condition" (dois clubes aceitando ao mesmo tempo)
    console.log('⚔️  Simulando disputa entre dois clubes...');
    
    const promise1 = axios.post(`${API_URL}/claim/${auctionId}`, 
      { clubId: '4576b1a6-618a-4158-bc36-fc2783435bcf', courtId: 'b54a5b05-7935-4d52-be73-5402a098d2f0' }, 
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    );

    const promise2 = axios.post(`${API_URL}/claim/${auctionId}`, 
      { clubId: 'club_beta', courtId: 'court_2' }, 
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    );

    const results = await Promise.allSettled([promise1, promise2]);

    results.forEach((res, i) => {
      const club = i === 0 ? 'Club Alpha' : 'Club Beta';
      if (res.status === 'fulfilled') {
        console.log(`🏆 ${club}: VENCEU e garantiu a quadra!`);
      } else {
        // @ts-ignore
        console.log(`❌ ${club}: PERDEU (Motivo: ${res.reason.response?.data?.message})`);
      }
    });

  } catch (error: any) {
    console.error('⚠️ Erro no teste:', error.response?.data || error.message);
  }
}

runTest();