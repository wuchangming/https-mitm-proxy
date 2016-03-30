const utils = require('./utils');
module.exports = class CertAndKeyContainer {
    constructor(maxLength = 1000) {
        this.queue = [];
        this.maxLength = maxLength;
    }
    addCert (mappingHostNames, cert, key) {
        if (this.queue.length >= this.maxLength) {
            this.queue.shift();
        }

        var certObj = {
            mappingHostNames,
            cert,
            key
        }

        this.queue.push(certObj);
    }
    getCert (hostname) {
        for (let i = 0; i < this.queue; i++) {
            let certObj = this.queue[i];
            let mappingHostNames = certObj.mappingHostNames;
            for (let j = 0; j < mappingHostNames.length; j++) {
                let DNSName = mappingHostNames[j];
                if (utils.isMappingHostName(DNSName, hostname)) {
                    this.rankCert(i);
                    return rCert;
                }
            }
        }
        return null;
    }
    rankCert (index) {
        // index ==> queue foot
        this.queue.push((this.queue.splice(index, 1))[0]);
    }
}
