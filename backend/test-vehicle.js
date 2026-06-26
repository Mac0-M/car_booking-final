const axios = require('axios');
async function test() {
  try {
    const loginRes = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'superadmin@admin.com',
      password: 'superadmin'
    });
    const token = loginRes.data.data.access_token;
    
    // Test updating vehicle 1
    const res = await axios.patch('http://localhost:3000/api/v1/vehicles/1', {
      vehicle_name: 'Toyota Camry (กข-1234) Edited',
      type: 'Sedan',
      capacity: 4,
      re_fuel: false,
      total_mile: 12500,
      status: 'available'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Update success:', res.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}
test();
