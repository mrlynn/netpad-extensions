import axios from 'axios';

async function run() {
  const response = await axios.post(process.env.NETPAD_API_URL + '/command', {
    type: 'code_analysis',
    input: {
      code: "function hello() { return 'world'; }",
      language: "javascript",
      analysisType: "summary"
    }
  }, {
    headers: {
      'X-API-Key': process.env.NETPAD_API_KEY
    }
  });

  console.log('Response:', response.data);
}

run().catch(console.error);