'use strict'

const CertAndKeyContainer = require('./common/CertAndKeyContainer');
const https = require('https');
const url = require('url');
const utils = require('./common/utils');
const fs = require('fs');
const forge = require('node-forge');
const _ = require('lodash');
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
        console.log(srvUrl.hostname);
        var preReq = https.request({
            port: srvUrl.port,
            hostname: srvUrl.hostname
        }, (preRes) => {
            var realCert  = preRes.socket.getPeerCertificate();
            preRes.socket.end();
            preReq.end();
            console.log(realCert);
            if (Object.keys(realCert).length == 0) {
                callback(7878);
                return
            }

            var obj = forge.asn1.fromDer(realCert.raw.toString('binary'));
            var certificate = forge.pki.certificateFromAsn1(obj);
            console.log(certificate);

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

            cert.setSubject(certificate.subject.attributes);
            cert.setIssuer(caCert.subject.attributes);

            certificate.subjectaltname && (cert.subjectaltname = certificate.subjectaltname);
            var realSubjectAltName = realCert.subjectaltname;

            var dnsString = realSubjectAltName.replace(/DNS:/g, '');

            var dnsArr = dnsString.split(',');

            // var newAltName = [];
            // dnsArr.map((dns) => {
            //     var tem = {};
            //     tem.type = 2;
            //     tem.value = dns;
            //     newAltName.push(tem);
            // });

            var subjectAltName = _.find(certificate.extensions, {name: 'subjectAltName'});
            // console.log('!!!!!!',JSON.stringify(eee));
            // cert.setExtensions(certificate.extensions);
            // JSON.stringify(certificate.extensions);
            cert.setExtensions([{
              name: 'basicConstraints',
              critical: true,
              cA: false
            },
            {
              name: 'subjectAltName',
              altNames: subjectAltName.altNames
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

            });
            console.log('create 7878');
            callback(7878);

        });
        preReq.end();
        preReq.on('error', (e) => {
          console.error(e);
        });
    }
}
