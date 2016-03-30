const HttpsMitmProxy = require('../../src/HttpsMitmProxy');
const domain = require('domain');
const http = require('http');
const url = require('url');
const net = require('net');

var d = domain.create();


var server = new http.Server();

var httpsMitmProxy = new HttpsMitmProxy();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


server.listen(9888, () => {
    console.log('start');
    server.on('error', (e) => {
        console.error(e);
    });
    server.on('request', (req, res) => {
        d.run(() => {
            // this.requestHandler(req, res);
        });
    });
    // tunneling for https
    server.on('connect', (req, cltSocket, head) => {
        console.log('connect');
        d.run(() => {
            // connect to an origin server
            var srvUrl = url.parse(`http://${req.url}`);
            console.log(srvUrl.url);
            if (srvUrl.hostname === 'www.baidu.com') {
                httpsMitmProxy.requestFakeServer(req.url, (port) => {
                    console.log(port);
                    var srvSocket = net.connect(port, '127.0.0.1', () => {
                        cltSocket.write('HTTP/1.1 200 Connection Established\r\n' +
                        'Proxy-agent: SpyProxy\r\n' +
                        '\r\n');
                        srvSocket.write(head);
                        srvSocket.pipe(cltSocket);
                        cltSocket.pipe(srvSocket);
                    });
                });
            } else {
                var srvUrl = url.parse(`http://${req.url}`);
                console.log(srvUrl);
                    var srvSocket = net.connect(srvUrl.port, srvUrl.hostname, () => {
                        cltSocket.write('HTTP/1.1 200 Connection Established\r\n' +
                        'Proxy-agent: SpyProxy\r\n' +
                        '\r\n');
                        srvSocket.write(head);
                        srvSocket.pipe(cltSocket);
                        cltSocket.pipe(srvSocket);
                    });
            }

        });
    });
});
