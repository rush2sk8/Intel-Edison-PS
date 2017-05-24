//tcp server
'use strict';

const ip = '127.0.0.1';
const port = 1337;
var connections = []
var clients = []

//client class
function Client(ip, port) {
    var n = require('net');
    this.client = new n.Socket();
    this.ip = ip;
    this.port = port;
}

//connects to endpoint and sends a number to it
Client.prototype.run = function () {

    this.client.connect(this.port, this.ip, function () {

        this.write('' + Math.random());
    });

    this.client.on('data', function (data) {

        console.log('Data from server: ' + data);
        var d = this;
        setTimeout(function () {
            d.destroy();
        }, 3000);
    });

    this.client.on('close', function () {
        console.log(this.ip + ' closed')
    });

    this.client.on('crror', function () {
        console.log('error on' + this.ip);
    });
};


function Server(ip, port) {
    this.ip = ip;
    this.port = port;
    this.server;

}
//starts listening for connections
Server.prototype.start = function () {
    var net = require('net');

    this.server = net.createServer(function (socket) {

        //write server ip to client
        socket.write(this.ip + '');
        socket.pipe(socket);

        //ignore random errors
        socket.on('error', function () {
        });

        //get data
        socket.on('data', function (data) {
            console.log((new Buffer(data)).toString());
        });
        connections.push(socket);
    });
    this.server.timeout = 0;

    //listen for incoming connections
    this.server.listen(this.port, this.ip);

};

Server.prototype.sendUpdate = function (data) {

    connections.forEach(function (value) {
        value.write(data);
    });

}


var server = (new Server('127.0.0.1', 1337));
server.start();
setInterval(function () {
    server.sendUpdate('hi');
}, 5000);