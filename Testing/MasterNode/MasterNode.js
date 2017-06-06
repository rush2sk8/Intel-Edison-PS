var sensors = [];
var conns = [];
var net = require('net');

/**
 * Creates the server that brokers the connections
 */
var server = net.createServer(function (socket) {

    socket.on('data', function (data) {

        //reads all incoming data
        var stringData = new Buffer(data).toString();

        //split it by the delimiter
        var command = stringData.split('-');

        //if the command new node is requested
        if (command[0] == 'nn') {

            //create a new sensor node object
            var sn = new SensorNode(command[1], command[2], command[3]);

            //check to see if the node is already in the list
            if (hasNode(sn) === false) {
                sensors.push(sn);

                //since the node is new in the network broadcast the new node to the others in the network
                conns.forEach(function (s) {

                    //skip over the same node
                    if (s !== socket)
                        s.write('nl-' + sn.getString());
                })
            }

            //send the list of the connected nodes to the new node
            sendNodeListToDevice(socket);
        }

        console.log(sensors);
    });

    //ignore errors
    socket.on('error', function () {
    });

    //hold the socket to the current node
    conns.push(socket);

});

/**
 * Returns true if we have the node already in out table
 * @param tosee
 * @returns {boolean}
 */
function hasNode(tosee) {

    for (var i = 0; i < sensors.length; i++) {

        if (sensors[i].getString() == tosee.getString())
            return true;

    }
    return false;
}

/**
 * Sends a list of all the connected devices to the socket
 * @param socket -- the new node
 */
function sendNodeListToDevice(socket) {

    //gets the new node ip
    var ipofsocket = socket.remoteAddress;


    sensors.forEach(function (sensor) {

        //writes the connected sensor information to the new nodes
        if (sensor.ip !== ipofsocket)
            socket.write('nl-' + sensor.getString())
    });

}

/**
 * Sensor node data type
 * @param hostname
 * @param ip
 * @param sensors
 * @constructor
 */
function SensorNode(hostname, ip, sensors) {
    this.hostname = hostname;
    this.ip = ip;
    this.sensors = sensors;
}

/**
 * ToString for sensor node
 * @memberof SensorNode
 * @returns {string}
 */
SensorNode.prototype.getString = function () {
    return this.hostname + '-' + this.ip + '-' + this.sensors;
};

//start listening for connections
server.listen(9999, '10.20.0.128');