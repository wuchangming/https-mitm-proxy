const https = require('https');
const utils = require('utils');

module.exports = class FakeServersCenter {
    constructor({maxLength = 50, requestCB, errorCB}) {
        this.queue = [];
        this.maxLength = maxLength;
        this.requestCB = requestCB;
        this.errorCB = errorCB;
    }
    addServer ({mappingHostNames, cert, key}) {
        if (this.queue.length >= this.maxLength) {
            var delServerObj = this.queue.shift();
            delServerObj.server.close();
        }
        var fakeServer = new https.Server({
            key,
            cert
        });
        var serverObj = {
            mappingHostNames,
            cert,
            key,
            server: fakeServer,
            port: 0  // if prot === 0 ,should listen server's `listening` event.
        }
        fakeServer.listen(0, () => {
            var address = fakeServer.address();
            serverObj.port = address.port;
        });
        this.queue.push(serverObj);
    }
    getServer (hostname) {
        for (let i = 0; i < this.queue; i++) {
            let serverObj = this.queue[i];
            let mappingHostNames = serverObj.mappingHostNames;
            for (let j = 0; j < mappingHostNames.length; j++) {
                let DNSName = mappingHostNames[j];
                if (utils.isMappingHostName(DNSName, hostname)) {
                    this.rankServer(i);
                    return serverObj;
                }
            }
        }
        return null;
    }
    rankServer (index) {
        // index ==> queue foot
        this.queue.push((this.queue.splice(index, 1))[0]);
    }

}
