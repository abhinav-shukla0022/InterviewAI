const http = require('http');

const data = JSON.stringify({
  resumeText: 'React expert with Node.js and MongoDB skills',
  difficulty: 'Medium'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/generate-question',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  res.on('end', () => {
    console.log('RESPONSE:', body);
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.error('ERROR:', error.message);
  process.exit(1);
});

req.write(data);
req.end();

// Timeout after 30 seconds
setTimeout(() => {
  console.error('TIMEOUT');
  process.exit(1);
}, 30000);
