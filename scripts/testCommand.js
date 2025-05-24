
const axios = require('axios');

const API_URL = process.env.NETPAD_API_URL || 'https://netpad.io/api/mcp/tools';
const API_KEY = process.env.NETPAD_API_KEY || 'mcp_fe6a518107ccad44a465a35c7a92e896';

async function testConnection() {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        'X-API-Key': API_KEY
      }
    });

    console.log('✅ Connected to NetPad API successfully!');
    console.log('Tools:', response.data.tools || response.data);
  } catch (error) {
    if (error.response) {
      console.error('❌ API responded with error:', error.response.status);
      console.error('Message:', error.response.data?.error?.message || error.response.statusText);
    } else {
      console.error('❌ Connection error:', error.message);
    }
  }
}

testConnection();
