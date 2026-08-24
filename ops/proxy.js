const axios = require('axios');
const http = require('http');
// La direccion de Kodi sale del entorno: hardcodearla obliga a editar el
// archivo a cualquiera que clone el repositorio.
//   KODI_URL=http://192.168.1.50:8080 npm run proxy
const KODI_URL = process.env.KODI_URL || 'http://localhost:8080';
const urlPath = `${KODI_URL.replace(/\/$/, '')}/jsonrpc`;

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
  console.log(`Reenviando a ${urlPath}`);
  console.log('Server running at http://localhost:8008/');
});
