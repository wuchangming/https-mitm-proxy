const path = require('path');
exports.getCACertPath = function () {
    return path.resolve(__dirname, '../../test/ca/spy-debugger.ca.pem');
}
exports.getCAKeyPath = function () {
    return path.resolve(__dirname, '../../test/ca/spy-debugger.ca.key.pem');
}
exports.isBrowserRequest = function () {
    return /Mozilla/i.test(userAgent);
}
//
//  /^[^.]+\.a\.com$/.test('c.a.com')
//
exports.isMappingHostName = function (DNSName, hostname) {
    var reg = DNSName.replace(/\./g, '\\.').replace(/\*/g, '[^.]+');
    reg = '^' + reg + '$';
    return (new RegExp(reg)).test(hostname);
}
