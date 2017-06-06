var Client = require('./Client.js');
var Server = require('./Server.js');
var net = require('net');
var subscribers = [];

//TODO actually add the connections

/**
 *
 * @param ip -- ip address of the master node
 * @param port -- port of the master node
 * @param mysensors -- list of sensors that i have delimited my a colon ex- 'light:smoke:co2'
 * @param want -- list of sensors i want delimited by a colon
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

/**
 * Starts the discorvery and connection service
 */
MasterNodeConnection.prototype.startAutomaticDiscovery = function () {
    var that = this;
    this.server = new Server(this.myIP, 1337, 0);
    this.server.start();

    //master connection
    var clientConnToMN = new net.Socket();

    //connect to master node endpoint
    clientConnToMN.connect(this.port, this.ip, function () {
        console.log('connected to: ' + that.ip + ' !');
        this.write('nn-' + (require('os').hostname()) + '-' + that.myIP + '-' + that.mySensors);
    });

    //TODO add connections
    clientConnToMN.on('data', function (data) {
        console.log(new Buffer(data).toString());
    });

    //TODO add automatic reconnect
    clientConnToMN.on('close', function () {
        console.log(that.ip + ' closed')
    });

};

/**
 * Push data to all the subscribed connections
 * @param data
 */
MasterNodeConnection.prototype.publishDataToSubscribers = function (data) {
    this.server.sendUpdate(data);
};


/**
 * Helper function that returns the ip of THIS device
 * @returns {String}
 */
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

//NodeJS thing so that i can make this a class
module.exports = MasterNodeConnection;