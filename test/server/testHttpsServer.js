const https = require('https');
const path = require('path');
const fs = require('fs');

// var server = https.Server();

const options = {
  key: fs.readFileSync(path.resolve(__dirname, '../../src/baidu.com.crt.key.pem')),
  cert: fs.readFileSync(path.resolve(__dirname, '../../src/baidu.com.crt.pem'))
};

https.createServer(options, (req, res) => {
  res.writeHead(200);
  res.end('hello world\n');
}).listen(7777);
