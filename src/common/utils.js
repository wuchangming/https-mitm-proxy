const path = require('path');
exports.getCACertPath = function () {
    return path.resolve(__dirname, '../../test/ca/spy-debugger.ca.pem');
}
exports.getCAKeyPath = function () {
    return path.resolve(__dirname, '../../test/ca/spy-debugger.ca.key.pem');
}
