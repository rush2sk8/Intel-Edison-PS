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


    });

    this.client.on('data', function (data) {

        if (typeof data != 'undefined') {

            console.log('Received: ' + data);

        }
    });


    this.client.on('close', function () {
        console.log(this.ip + ' closed')
    });

    this.client.on('error', function () {
        console.log('error on' + this.ip);
    });


};

function Server(ip, port) {
    this.ip = ip;
    this.port = port;
    this.server;
    this.hostname = require('os').hostname();
    this.seqnum = 0;
    this.log = []
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
    var s = this.seqnum;
    const h = this.hostname;
    const l = this.log;
    console.log(s);

    //write data to each saved socket
    connections.forEach(function (value) {

        //check if the socket is still alive
        if (value.address().address !== undefined) {

            const start = process.hrtime();

            value.write(s + ':' + data + '');
            const timetaken = process.hrtime(start);
            const logData = {
                'txnode id': h,
                'sensorid': value.address().address,
                'seqnum': s,
                'tx event time': timetaken
            };

            console.log(logData);
            l.push(JSON.stringify(logData));
        }
        //if its dead then remove it so we dont keep transmitting to a closed connection
        else{
           const i = connections.indexOf(value);
           if(i != -1)
               connections.splice(i, 1);

        }
    });

    this.seqnum++;
};

Server.prototype.getLog = function () {
    return this.log;
};

Server.prototype.deleteFromLog = function (toRemove) {
    const i = this.log.indexOf(toRemove);
    if (i != -1) {
        this.log.splice(i, 1);
    }
};

function getNodeList() {
    connections.forEach(function (sock) {
        console.log(connections);
    });
}


const ip = '127.0.0.1';
const port = 1337;

var server = new Server(ip, port);
server.start();

setInterval(function () {
    server.sendUpdate(Math.random());
}, 1000);

setInterval(function () {
    var d = server.getLog();
    d.forEach(function (p) {
        fs.appendFile('data.txt', p + '\r\n', function () {
            server.deleteFromLog(p);
        });
    })

}, 5000);





