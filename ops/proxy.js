
const axios = require('axios');
const http = require('http');
const urlPath = 'http://192.168.0.178:8080/jsonrpc';
// Usage example
const payloadMock = [
    {
        "jsonrpc": "2.0",
        "method": "Application.SetVolume",
        "params": [
            60
        ],
        "id": 40
    }
];

async function postData(url, data) {
    const response = await axios.post(url, data);
    return response;
}

// postData(url, data)
//     .then(response => {
//         console.log('Response:', response);
//     })
//     .catch(error => {
//         console.error('Error:', error);
//     });

// Server listen on localhost:8008
const server = http.createServer(async (req, res) => {

    let body = '';
    req.on('data', chunk => {
        body += chunk.toString(); // convert Buffer to string
    });
    req.on('end', async () => {
        //  console.log('Request received', body);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Content-Type', 'application/json');
        console.log('Body:', body);
        const payload = JSON.parse(body);
        console.log('Payload:', payload);
        const response = await postData(urlPath, payload);
        console.log('Response:', response.statusText);
        res.statusCode = response.status;
        res.statusMessage = response.statusText;
        res.end(JSON.stringify(response.data));
    });
});

server.listen(8008, 'localhost', () => {
    console.log('Server running at http://localhost:8008/');
});


// async function postData(url, data) {
//     try {
//         const response = await axios.post(url, data);
//         return response.data;
//     } catch (error) {
//         console.error('Error:', error.message);
//         throw error;
//     }
// }
