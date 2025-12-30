import axios from 'axios';

const API_URL = 'http://127.0.0.1:3000';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsImtpZCI6IlRJcWVlUnM3eitqa3pJTEYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FtYnl6cHVwZ3Riemt6bXl5bmVoLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI2NDBmODEwZi1iNGJmLTQyNGItYmRiMy0yMDczYzNhYTIzYWQiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzY3MTEyNjQ2LCJpYXQiOjE3NjcxMDkwNDYsImVtYWlsIjoidGVzdGVAY2xpbWIuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbF92ZXJpZmllZCI6dHJ1ZX0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NjcxMDkwNDZ9XSwic2Vzc2lvbl9pZCI6ImFiZDNkNWJjLTYyYzEtNDNjMC1hYzRjLWE1NTI0YzdiYjcxYiIsImlzX2Fub255bW91cyI6ZmFsc2V9.9V2RubQ1M4X2NUrz4d9usFplT0BmhOvZgf5vofuTIuU'; // Use a mesma do dashboard/test-sockets

async function testDirectBooking() {
  const bookingData = {
    court_id: 'b54a5b05-7935-4d52-be73-5402a098d2f0', // ID de uma quadra real do seu log
    booking_date: '2025-12-31',
    start_time: '10:00:00',
    end_time: '11:30:00'
  };

  console.log('🚀 Tentando agendamento direto...');

  try {
    // 1. Primeira tentativa: Deve funcionar
    const res1 = await axios.post(`${API_URL}/bookings`, bookingData, {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
    });
    console.log('✅ Primeira reserva confirmada:', res1.data.id);

    // 2. Segunda tentativa: Deve falhar (Conflito de horário)
    console.log('⏳ Testando proteção contra conflito (Double Booking)...');
    await axios.post(`${API_URL}/bookings`, bookingData, {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
    });
  } catch (error: any) {
    if (error.response?.status === 409 || error.response?.status === 400) {
      console.log('🛡️ Sucesso no teste: O sistema bloqueou o conflito de horário!');
    } else {
      console.error('❌ Erro inesperado:', error.response?.data || error.message);
    }
  }
}

testDirectBooking();