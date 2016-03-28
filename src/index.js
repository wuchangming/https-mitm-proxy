const https = require('https');
const fs = require('fs');
const path  = require('path');
const forge = require('node-forge');

var pki = forge.pki;

var options = {
  hostname: 'www.baidu.com',
  port: 443,
  path: '/',
  method: 'GET'
};

var req = https.request(options, (res) => {
  // console.log('statusCode: ', res.statusCode);
  // console.log('headers: ', res.headers);

  var realCert  = res.socket.getPeerCertificate();


  var privateKeyPem = fs.readFileSync(path.resolve(__dirname, '../test/ca/spy-debugger.ca.key.pem'), 'utf-8');

  console.log('privateKeyPem !!!', privateKeyPem);

  var privateCAKey = forge.pki.privateKeyFromPem(privateKeyPem);

  var caCertPem = fs.readFileSync(path.resolve(__dirname, '../test/ca/spy-debugger.ca.pem'), 'utf-8');


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
  /* alternatively set extensions from a csr
  var extensions = csr.getAttribute({name: 'extensionRequest'}).extensions;
  // optionally add more extensions
  extensions.push.apply(extensions, [{
    name: 'basicConstraints',
    cA: true
  }, {
    name: 'keyUsage',
    keyCertSign: true,
    digitalSignature: true,
    nonRepudiation: true,
    keyEncipherment: true,
    dataEncipherment: true
  }]);
  cert.setExtensions(extensions);
  */
  // self-sign certificate
  cert.sign(privateCAKey, forge.md.sha256.create());

  // convert a Forge certificate to PEM
  var pem = pki.certificateToPem(cert);

  var privatePem = pki.privateKeyToPem(keys.privateKey);


  fs.writeFile(path.resolve(__dirname, `./${realCert.subject.CN}.crt.pem`), pem, (err) => {
    if (err) throw err;
    console.log('It\'s saved!');
  });

  fs.writeFile(path.resolve(__dirname, `./${realCert.subject.CN}.crt.key.pem`), privatePem, (err) => {
    if (err) throw err;
    console.log('It\'s saved!');
  });


});
req.end();

req.on('error', (e) => {
  console.error(e);
});
