'use strict'
module.exports = class CertAndKeyContainer {
    constructor(maxLength) {
        this.queue = [];
        this.maxLength = maxLength || 1000;
    }
    addCert (name, cert, key) {
        if (this.queue.length >= this.maxLength) {
            this.queue.shift();
        }

        this.deleteCert(name);

        var certObj = {
            name: name,
            cert,
            key
        }
        this.queue.push(cert);
    }
    getCert (name) {
        var rCert = null;
        this.queue.map((certObj) => {
            if (certObj.name === name) {
                rCert = certObj;
            }
        });
        return rCert;
    }
    deleteCert (name) {
        var deleteIndex;
        this.queue.map((certObj, index) => {
            if (certObj.name === name) {
                deleteIndex = index;
            }
        });
        if(typeof deleteIndex === 'number') {
            return this.queue.splice(deleteIndex, 1);
        }
        return
    }
}
