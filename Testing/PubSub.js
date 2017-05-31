/**Rushad Antia**/
'use strict';
//TODO JSDOC add push button to affect all the other


/****************************************************MAIN****************************************************/
const ip = '127.0.0.1';
const port = 1337;

var Server = require("./server.js");

var server = new Server(ip,port,0);

server.start();
setInterval(function () {
    server.sendUpdate(Math.random());
},1000);


/****************************************************MAIN****************************************************/

var dh = function (data) {
    console.log(data);

};

var Client = require('./client.js');
var client = new Client(ip, port, dh);
client.run();