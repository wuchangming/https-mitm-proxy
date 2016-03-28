'use strict'

const CertAndKeyContainer = require('./common/CertAndKeyContainer');
const https = require('https');
const url = require('url');
const utils = require('./common/utils');
const fs = require('fs');
const forge = require('node-forge');
var pki = forge.pki;

var arrpp;

module.exports = class HttpsMitmProxy {
    constructor() {
        this.certAndKeyContainer = new CertAndKeyContainer();
        this.caCertPem = fs.readFileSync(utils.getCACertPath());
        this.caKeyPem = fs.readFileSync(utils.getCAKeyPath());
    }
    requestFakeServer(reqUrl, callback) {
        var srvUrl = url.parse(`http://${reqUrl}`);
        console.log(reqUrl);
        var preReq = https.request({
            port: srvUrl.port,
            hostname: srvUrl.hostname
        }, (preRes) => {
            var realCert  = preRes.socket.getPeerCertificate();
            console.log(realCert);
            if (Object.keys(realCert).length == 0) {
                callback(7878);
                return
            }

            var privateKeyPem = this.caKeyPem;

            var privateCAKey = forge.pki.privateKeyFromPem(privateKeyPem);

            var caCertPem = this.caCertPem;
            var caCert = forge.pki.certificateFromPem(caCertPem);

            var keys = pki.rsa.generateKeyPair(2048);
            var cert = pki.createCertificate();
            cert.publicKey = keys.publicKey;

            cert.serialNumber = realCert.serialNumber;
            cert.validity.notBefore = new Date();
            cert.validity.notAfter = new Date();
            cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 3);


            var realSubject = Object.assign(realCert.subject);
            var newSubject = [];
            Object.keys(realSubject).map((key) => {
                var tem = {};
                tem.shortName = key;
                tem.value = realSubject[key];
                newSubject.push(tem);
            });

            cert.setSubject(newSubject);
            cert.setIssuer(caCert.subject.attributes);


            var realSubjectAltName = realCert.subjectaltname;

            var dnsString = realSubjectAltName.replace(/DNS:/g, '');

            var dnsArr = dnsString.split(',');

            var newAltName = [];
            dnsArr.map((dns) => {
                var tem = {};
                tem.type = 2;
                tem.value = dns;
                newAltName.push(tem);
            });

            cert.setExtensions([{
              name: 'basicConstraints',
              critical: true,
              cA: false
            }, {
              name: 'keyUsage',
              keyCertSign: true,
              digitalSignature: true,
              nonRepudiation: true,
              keyEncipherment: true,
              dataEncipherment: true
            }, {
              name: 'extKeyUsage',
              serverAuth: true,
              clientAuth: true,
              codeSigning: true,
              emailProtection: true,
              timeStamping: true
            }, {
              name: 'nsCertType',
              client: true,
              server: true,
              email: true,
              objsign: true,
              sslCA: true,
              emailCA: true,
              objCA: true
            },
            {
              name: 'subjectAltName',
              altNames: newAltName
            },
            {
              name: 'subjectKeyIdentifier'
            }]);
            cert.sign(privateCAKey, forge.md.sha256.create());
            var pem = pki.certificateToPem(cert);
            var privatePem = pki.privateKeyToPem(keys.privateKey);

            var fakeServer = new https.Server({
                key: privatePem,
                cert: pem
            });
            fakeServer.listen(7878, () => {
                var address = fakeServer.address();
                fakeServer.on('request', (req, res) => {
                    res.writeHead(200);
                    res.end('hello world\n');
                    arrpp = 7878;
                });
                callback(7878);
            });

        });
        preReq.end();
        preReq.on('error', (e) => {
          console.error(e);
        });
    }
}
