'use strict';

//holds sockets to each connected clients
var connections = []
var fs = require('fs');


//client class
function Client(ip, port, dataHandler) {
    var n = require('net');
    this.client = new n.Socket();
    this.connHN = '';
    this.ip = ip;
    this.port = port;
    this.log = []
    this.dh = dataHandler;
}

//connects to endpoint and sends a number to it
Client.prototype.run = function () {

    this.client.connect(this.port, this.ip, function () {


    });


    this.client.on('data', this.dh);
    /*function (data) {

        if (data !== undefined) {

            console.log('Received: ' + data);

        }
    });*/

    //handles when the connection closes
    this.client.on('close', function () {
        console.log(this.ip + ' closed')
    });

    //handles errors
    this.client.on('error', function () {
        console.log('error on' + this.ip);
    });

};


//server class
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
    var that = this;

    this.server = net.createServer(function (socket) {

        //write server ip to client
        socket.write(that.ip + '');

        //ignore random errors
        socket.on('error', function () {});

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
    var that = this;

    //write data to each saved socket
    connections.forEach(function (value) {

        //check if the socket is still alive
        if (value.address().address !== undefined) {

            const start = process.hrtime();

            //write data to end device
            value.write(that.seqnum + ':' + data + '');

            //calculate tx time
            const timetaken = process.hrtime(start);

            //data to stringify
            const logData = {
                'txnode id': that.hostname,
                'sensorid': value.address().address,
                'seqnum': that.seqnum,
                'tx event time': timetaken
            };

            console.log(logData);

            //store that data in an array
            that.log.push(JSON.stringify(logData));
        }
        //if its dead then remove it so we dont keep transmitting to a closed connection
        else{
           const i = connections.indexOf(value);
           if(i != -1)
               connections.splice(i, 1);

        }
    });

    //increment packet number
    this.seqnum++;
};

//gets the data log
Server.prototype.getLog = function () {
    return this.log;
};

//removes data element from the log
Server.prototype.deleteFromLog = function (toRemove) {
    const i = this.log.indexOf(toRemove);
    if (i != -1) {
        this.log.splice(i, 1);
    }
};

Server.prototype.writeLogToFile = function (filename) {
    var that = this;
    this.log.forEach(function (data) {
        fs.appendFile(filename, data+'\r\n', function () {
            that.deleteFromLog(data);
        })
    });
};

//returns list of connected devices
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
  server.writeLogToFile('txlog.txt');
}, 5000);





