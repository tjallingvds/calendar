const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Test server works!');
});

server.listen(3001, () => {
  console.log('✅ Test server running on http://localhost:3001');
});

