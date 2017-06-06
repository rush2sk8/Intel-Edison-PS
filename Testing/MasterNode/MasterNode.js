var sensors = [];
var conns = [];
var net = require('net');

var server = net.createServer(function (socket) {

    socket.on('data', function (data) {
        var stringData = new Buffer(data).toString();
        var command = stringData.split('-');

        if (command[0] == 'nn') {
            sensors.push(new SensorNode(command[1], command[2], command[3]));
            sendNodeListToDevice(socket);
        }

        console.log(stringData);

    });

    socket.on('error', function () {
    });

    conns.push(socket);

});


server.listen(9999, '10.20.0.128');


function sendNodeListToDevice(socket) {


}

function SensorNode(hostname, ip, sensors) {
    this.hostname = hostname;
    this.ip = ip;
    this.sensors = sensors;
}