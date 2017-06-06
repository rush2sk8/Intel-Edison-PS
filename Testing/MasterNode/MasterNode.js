var sensors = [];
var conns = [];
var net = require('net');

var server = net.createServer(function (socket) {

    socket.on('data', function (data) {
        var stringData = new Buffer(data).toString();
        var command = stringData.split('-');

        if (command[0] == 'nn') {
            var sn = new SensorNode(command[1], command[2], command[3]);

            if (hasNode(sn) === false) {
                sensors.push(sn);
                conns.forEach(function (s) {
                    if (s !== socket)
                        s.write('nl-' + sn.getString());
                })
            }


            sendNodeListToDevice(socket);
        }

        console.log(sensors);
    });

    socket.on('error', function () {
    });

    conns.push(socket);

});

function hasNode(tosee) {

    for (var i = 0; i < sensors.length; i++) {

        if (sensors[i].getString() == tosee.getString())
            return true;

    }
    return false;
}

function sendNodeListToDevice(socket) {

    var ipofsocket = socket.remoteAddress;

    sensors.forEach(function (sensor) {

        if (sensor.ip !== ipofsocket) {
            socket.write('nl-' + sensor.getString())
        }

    });

}

function SensorNode(hostname, ip, sensors) {
    this.hostname = hostname;
    this.ip = ip;
    this.sensors = sensors;
}

SensorNode.prototype.getString = function () {
    return this.hostname + '-' + this.ip + '-' + this.sensors;
};


server.listen(9999, '10.20.0.128');