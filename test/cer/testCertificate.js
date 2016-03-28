const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

var pki = forge.pki;

var caCertPem;
var privateKeyPem = fs.readFileSync(path.resolve(__dirname, '../ca/spy-debugger.ca.key.pem'), 'utf-8');

console.log('privateKeyPem !!!', privateKeyPem);

var privateCAKey = forge.pki.privateKeyFromPem(privateKeyPem);

var caCertPem = fs.readFileSync(path.resolve(__dirname, '../ca/spy-debugger.ca.pem'), 'utf-8');


var caCert = forge.pki.certificateFromPem(caCertPem);

var keys = pki.rsa.generateKeyPair(2048);
var cert = pki.createCertificate();
cert.publicKey = keys.publicKey;

cert.serialNumber = (new Date()).getTime() + '';
console.log(cert.serialNumber);
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 3);
var attrs = [{
  name: 'commonName',
  value: 'spy-debugger Cert'
}, {
  name: 'countryName',
  value: 'CN'
}, {
  shortName: 'ST',
  value: 'GuangDong'
}, {
  name: 'localityName',
  value: 'ShenZhen'
}, {
  name: 'organizationName',
  value: 'spy-debugger'
}, {
  shortName: 'OU',
  value: 'https://github.com/wuchangming/spy-debugger'
}];
cert.setSubject(attrs);
cert.setIssuer(caCert.subject.attributes);
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
  altNames: [{
    type: 2, // DNS
    value: 'spyweinrefortest.com'
  }]
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


fs.writeFile(path.resolve(__dirname, './spy-debugger.crt.pem'), pem, (err) => {
  if (err) throw err;
  console.log('It\'s saved!');
});

fs.writeFile(path.resolve(__dirname, './spy-debugger.crt.key.pem'), privatePem, (err) => {
  if (err) throw err;
  console.log('It\'s saved!');
});
