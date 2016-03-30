const https = require('https');
const path = require('path');
const fs = require('fs');
const http = require('http');

// var server = https.Server();

const options = {
  key: fs.readFileSync(path.resolve(__dirname, '../../src/baidu.com.crt.key.pem')),
  cert: fs.readFileSync(path.resolve(__dirname, '../../src/baidu.com.crt.pem'))
};

var fakeServer = new http.Server();
fakeServer.listen(0);

fakeServer.on('listening', () => {

    var address = fakeServer.address();

    console.log(address.port);

});
