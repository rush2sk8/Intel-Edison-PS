//Rushad Antia

"use strict";

//holds sockets to each connected clients
var connections = [];
var fs = require('fs');

var incoming_data = [];
var intervalIDLed;
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

       
      
       var rate = parseFloat((new Buffer(data)).toString());
        clearInterval(intervalIDLed);
         intervalIDLed = setInterval(writeLed, rate);
    }
}
)
;

this.client.on('close', function () {
    console.log(this.ip + ' closed');
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

};

function getNodeList() {
    connections.forEach(function (sock) {

        console.log(connections);
    });
}

/****************************************************MAIN****************************************************/
const ip = '10.20.0.11';
const port = 1337;

(new Client(ip, port)).run();


// MRAA, as per usual
var mraa = require('mraa');


// Set up a digital output on MRAA pin 20 (GP12)
var ledPin = new mraa.Gpio(20); // create an object for pin 20
ledPin.dir(mraa.DIR_OUT);  // set the direction of the pin to OUPUT


var BlinkNormalMs = 1000.0/5.0;
var BlinkAlertMs = 1000.0/50.0;

var analogIn ;
var lightThreshold = 0.8;
var lightSensorState = 1;  // 1 = above threshold, 0 = below

// global variable for pin state
var ledState = 0;
function writeLed() 
{
    // toggle state of led
    ledState = (ledPin.read()?0:1);
    // set led value
    ledPin.write(ledState);
}

intervalIDLed = setInterval(writeLed, BlinkNormalMs) ;  // start the periodic read
 


/**************************************************END MAIN**************************************************/