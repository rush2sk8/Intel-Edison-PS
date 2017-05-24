//Rushad Antia

'use strict';

//holds sockets to each connected clients
var connections = []
var fs = require('fs');

var incoming_data = [];

//client class
function Client(ip, port) {
    var n = require('net');
    this.client = new n.Socket();
    this.ip = ip;
    this.port = port;
    incoming_data.push(ip);
    incoming_data[ip] = [];
}

//connects to endpoint and sends a number to it
Client.prototype.run = function () {

    this.client.connect(this.port, this.ip, function () {

        this.write('' + Math.random());
    });

    this.client.on('data', function (data) {

        if (typeof data != 'undefined') {

        console.log('Received: ' + data);
        var timestamp = new Date();

        incoming_data[ip].push(ip + ' ' + (new Buffer(data)).toString() + ' ' + timestamp.getFullYear() + '-'
            + timestamp.getMonth() + '-' + timestamp.getDay() + ',' + timestamp.getHours() + ':' + timestamp.getMinutes() + ':' +
            timestamp.getSeconds()+'\r\n');
    }
}
)
;

this.client.on('close', function () {
    console.log(this.ip + ' closed')
});

this.client.on('error', function () {
    console.log('error on' + this.ip);
});
}
;


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

        //keep every socket to each client
        connections.push(socket);
    });
    this.server.timeout = 0;

    //listen for incoming connections
    this.server.listen(this.port, this.ip);

};

//sends data to connected clients
Server.prototype.sendUpdate = function (data) {

    //write data to each saved socket
    connections.forEach(function (value) {
        value.write(data + '');
    });

}


/****************************************************MAIN****************************************************/
const ip = '127.0.0.1';
const port = 1337;


(new Client(ip, port)).run();

//creates local server for testing
var server = (new Server(ip, port));
server.start();

//simulates sending node data
setInterval(function () {
    server.sendUpdate(Math.random() * 100);
}, 5000);

setInterval(function () {
    console.log(incoming_data);
}, 20 * 1000);

setInterval(function () {
    incoming_data.forEach(function (val) {
        fs.appendFile('data.txt', (incoming_data[val]), function () {
            incoming_data[val].length = 0;
            incoming_data[val] = []
        });

    });

    console.log("wrote");
}, 30 * 1000);

fs.appendFile('data.txt', 'IP Data Date Time');
/**************************************************END MAIN**************************************************/