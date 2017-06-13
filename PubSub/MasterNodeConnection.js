var Client = require('./Client.js');
var Server = require('./Server.js');
var net = require('net');

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
    var clientConnToMN = new net.Socket();

    //connect to master node endpoint
    clientConnToMN.connect(this.port, this.ip, function () {
        this.write('nn-' + (require('os').hostname()) + '-' + that.myIP + '-' + that.mySensors + '-' + that.want);
    });

    //handle the actual pub/sub creation
    clientConnToMN.on('data', function (data) {

        //put data into a string
        const stringData = (new Buffer(data)).toString();

        stringData.split('*').forEach(function (node) {

            //split the command
            var command = node.split('-');
            console.log('stringData: ' + command);

            //if the command is a new node in the network
            if (command[0] === 'ct') {

                //create a new client
                var newClient = new Client(command[2], 1337, that.dh);

                //run the client connection
                newClient.run();

                //keep a track of ongoing connections
                that.clients.push(newClient);

                console.log('connected to: ' + command[1]);
            } else if (command[0] == 'ping') {

                //ping in 2017
                clientConnToMN.write('pong');
            }

        });
    });

    //TODO add automatic reconnect 
    clientConnToMN.on('close', function () {
        console.log(that.ip + ' closed')
    });

    clientConnToMN.on('error', function () {
        console.log(that.ip + ' error')
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