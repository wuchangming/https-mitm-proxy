const https = require('https');
const forge = require('node-forge');

var options = {
    hostname: 'github.com',
    port: 443,
    path: '/',
    method: 'GET'
};

var req = https.request(options, (res) => {
    // console.log('statusCode: ', res.statusCode);
    // console.log('headers: ', res.headers);
    console.log('newSession');
    var realCert  = res.socket.getPeerCertificate();
    var obj = forge.asn1.fromDer(realCert.raw.toString('binary'));
    var certificate = forge.pki.certificateFromAsn1(obj);
    console.log(certificate);


    res.on('data', (d) => {
        // process.stdout.write(d);
    });
});
req.on('socket', function (socket) {
    // console.log(socket);
    socket.on('secure', function (tlsSocket) {

    });

});


req.end();

req.on('error', (e) => {
    // console.error(e);
});
