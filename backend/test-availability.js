const axios = require('axios');
async function test() {
  try {
    const loginRes = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'superadmin@admin.com',
      password: 'superadmin'
    });
    const token = loginRes.data.data.access_token;
    
    const res = await axios.get('http://localhost:3000/api/v1/vehicles/available', {
      params: {
        depart: '2026-06-26 15:00:00',
        return: '2026-06-26 17:00:00'
      },
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Available vehicles:', res.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}
test();
