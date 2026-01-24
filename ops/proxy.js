const axios = require('axios');
const http = require('http');
const urlPath = 'http://192.168.0.178:8080/jsonrpc';

async function postData(url, data) {
  const response = await axios.post(url, data);
  return response;
}

// Server listen on localhost:8008
const server = http.createServer(async (req, res) => {
  // CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    // Handle empty body
    if (!body || body.trim() === '') {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'Empty request body' }));
      return;
    }

    try {
      console.log('Body:', body);
      const payload = JSON.parse(body);
      console.log('Payload:', payload);
      const response = await postData(urlPath, payload);
      console.log('Response:', response.statusText);
      res.statusCode = response.status;
      res.statusMessage = response.statusText;
      res.end(JSON.stringify(response.data));
    } catch (error) {
      console.error('Error:', error.message);
      res.statusCode = 500;
      res.end(JSON.stringify({ error: error.message }));
    }
  });
});

server.listen(8008, 'localhost', () => {
  console.log('Server running at http://localhost:8008/');
});
