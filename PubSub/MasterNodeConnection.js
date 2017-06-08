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
 * Starts the discorvery and connection service
 */
MasterNodeConnection.prototype.startAutomaticDiscovery = function () {
    const that = this;
    this.server = new Server(this.myIP, 1337, 0);

    this.server.start();

    //master connection
    var clientConnToMN = new net.Socket();

    //connect to master node endpoint
    clientConnToMN.connect(this.port, this.ip, function () {
        console.log('connected to: ' + that.ip + ' !');
        this.write('nn-' + (require('os').hostname()) + '-' + that.myIP + '-' + that.mySensors);
    });

    //handle the actual pub/sub creation
    clientConnToMN.on('data', function (data) {

        //put data into a string
        const stringData = (new Buffer(data)).toString();

        //split the command
        var command = stringData.split('-');
        console.log('stringData: *' + stringData + '*');

        //if the command is a new node in the network 
        if (command[0] === 'nl') {

            //see what the sensors the new node has
            var sensors = command[3].split(':');

            //see what we want  
            var wants = that.want.split(':');

            //check to see if what they have is something they want
            for (var s = 0; s < sensors.length; s++) {
                for (var w = 0; w < wants.length; w++) {

                    //if they have something we want
                    if ((wants[w] === sensors[s]) && (wants[w] !== '') && (sensors[s] !== '')) {

                        console.log('found something i want\n attempting to connect...')
                            //create a new client
                        var newClient = new Client(command[2], 1337, that.dh);

                        //run the client connection
                        newClient.run();

                        //keep a track of ongoing connections
                        that.clients.push(newClient);

                        //break out of the loop
                        w = wants.length + 2;
                        s = sensors.length + 2;
                        break;
                    }
                }
            }

        }
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