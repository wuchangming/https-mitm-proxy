const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

var pki = forge.pki;

// generate a keypair and create an X.509v3 certificate
var keys = pki.rsa.generateKeyPair(2048);
var cert = pki.createCertificate();
cert.publicKey = keys.publicKey;
// alternatively set public key from a csr
//cert.publicKey = csr.publicKey;
cert.serialNumber = (new Date()).getTime() + '';
console.log(cert.serialNumber);
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 3);
var attrs = [{
  name: 'commonName',
  value: 'spy-debugger CA'
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
// alternatively set subject from a csr
//cert.setSubject(csr.subject.attributes);
cert.setIssuer(attrs);
cert.setExtensions([{
  name: 'basicConstraints',
  critical: true,
  cA: true
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
// {
//   name: 'subjectAltName',
//   altNames: [{
//     type: 6, // URI
//     value: 'http://example.org/webid#me'
//   }, {
//     type: 7, // IP
//     ip: '127.0.0.1'
//   }]
// },
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
cert.sign(keys.privateKey, forge.md.sha256.create());

// convert a Forge certificate to PEM
var pem = pki.certificateToPem(cert);

var privatePem = pki.privateKeyToPem(keys.privateKey);


// console.log(pem);

// convert a Forge certificate from PEM
// var cert = pki.certificateFromPem(pem);

fs.writeFile(path.resolve(__dirname, './spy-debugger.ca.pem'), pem, (err) => {
  if (err) throw err;
  console.log('It\'s saved!');
});

fs.writeFile(path.resolve(__dirname, './spy-debugger.ca.key.pem'), privatePem, (err) => {
  if (err) throw err;
  console.log('It\'s saved!');
});


// convert an ASN.1 X.509x3 object to a Forge certificate
// var cert = pki.certificateFromAsn1(obj);

// convert a Forge certificate to an ASN.1 X.509v3 object
// var asn1Cert = pki.certificateToAsn1(cert);
