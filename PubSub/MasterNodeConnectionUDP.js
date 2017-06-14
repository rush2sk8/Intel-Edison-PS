var Client = require('./Client.js');
var Server = require('./Server.js');
var net = require('net');
var dgram = require('dgram');
/**
 *
 * @param ip -- ip address of the master node
 * @param port -- port of the master node
 * @param mysensors -- list of sensors that  i have delimited my a colon ex- 'light:smoke:co2'
 * @param want -- list of sensors i want delimited by a colon
 * @param dh -- clientside data handler
 * @constructor 
 */
function MasterNodeConnection(ip, port, mysensors, want, dh) {
    this.ip = ip;
    this.port = port;
    this.mySensors = mysensors;
    this.myIP = getIPAddress();
    this.want = want;
    this.clients = [];
    this.server;
    this.dh = dh;
}

/** 
 * Starts the discovery and connection service
 */
MasterNodeConnection.prototype.startAutomaticDiscovery = function () {
    const that = this;
    this.server = new Server(this.myIP, 1337, 0);

    this.server.start();

    //master connection
    var clientConnToMN = dgram.createSocket('udp4');

    var init = new Buffer('nn-' + (require('os').hostname()) + '-' + that.myIP + '-' + that.mySensors + '-' + that.want);
    clientConnToMN.send(init, 0, init.length, this.port, this.ip, function (err, bytes) {});

    //handle the actual pub/sub creation
    clientConnToMN.on('message', function (message, remote) {

        //put data into a string
        const stringData = message.toString();
        console.log('stringData: ' + stringData)
        stringData.split('*').forEach(function (node) {

            //split the command
            var command = node.split('-');

            //if the command is a new node in the network
            if (command[0] === 'ct') {

                //create a new client
                var newClient = new Client(command[2], 1337, that.dh);

                //run the client connection
                newClient.run();

                //keep a track of ongoing connections
                that.clients.push(newClient);

                console.log('connected to: ' + command[1]);
            }

        });
    });

    clientConnToMN.bind(this.port, this.ip);
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