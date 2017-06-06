var Client = require('./Client.js');
var Server = require('./Server.js');
var net = require('net');

/**
 *
 * @param ip -- ip address of the master node
 * @param port -- port of the master node
 * @param mysensors -- list of sensors that i have delimited my a colon ex- 'light:smoke:co2'
 * @param want -- list of sensors i want delimited by
 * @constructor
 */
function MasterNodeConnection(ip, port, mysensors, want) {
    this.ip = ip;
    this.port = port;
    this.mySensors = mysensors;
    this.myIP = getIPAddress();
    this.want = want;
    this.clients = [];
    this.server;
}

MasterNodeConnection.prototype.startAutomaticDiscovery = function () {
    var that = this;
    this.server = new Server(this.myIP, 1337, 0);
    server.start();

    var clientConnToMN = new net.Socket();

    clientConnToMN.connect(this.ip, this.socket, function () {

        this.write('nn-' + (require('os').hostname()) + '-' + that.myIP + '-' + that.mySensors);
    });

    clientConnToMN.on('data', function (data) {
        console.log(data);
    });

    clientConnToMN.on('close', function () {
        console.log(that.ip + ' closed')
        that.client.destroy();
        that.client.unref();

        setTimeout(function () {
            that.client.connect(this.port, this.ip, function () {
                that.client.write('hn');
            });

        }, 5000);


    });

};

MasterNodeConnection.prototype.publishDataToSubscribers = function (data) {
    this.server.sendUpdate(data);
};


function getIPAddress() {
    var interfaces = require('os').networkInterfaces();
    for (var devName in interfaces) {
        var iface = interfaces[devName];

        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
                return alias.address;
        }
    }

    return '0.0.0.0';
}