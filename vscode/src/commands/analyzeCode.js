const axios = require('axios');

module.exports = async function analyzeCode(code) {
  const response = await axios.post('https://netpad.app/api/mcp/command', {
    type: 'code_analysis',
    input: {
      code,
      language: 'javascript',
      analysisType: 'summary'
    }
  });

  return response.data.output;
};