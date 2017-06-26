/*********************************************Node Code*****************************************************/

var sensors = [];
const net = require('net');
const fs = require('fs');

/**
* Creates the server that brokers the connections
*/
var server = net.createServer(function (socket) {
  socket.setNoDelay(true);

  socket.on('data', function (data) {

    //reads all incoming data
    const stringData = new Buffer(data).toString();

    console.log(stringData)

    //split it by the delimiter
    const command = stringData.split('-');

    //if the command new node is requested
    if (command[0] == 'nn') {

      //create a new sensor node object
      var sn = new SensorNode(command[1], command[2], command[3], command[4], socket);

      //check to see if the node is already in the list
      if (hasNode(sn) === false) {
        sensors.push(sn);
        io.sockets.emit('update-msg', {data: getTableString()});
      }

      sn.getSensorsToSubTo().forEach(function (s) {
        socket.write('ct-' + s.getString() + '*');
      });

      sn.getSensorsToPubTo();

    }
    else if(command[0] == 'cld'){

      for(var i =0 ; i < sensors.length; i++){

        if(sensors[i].hostname == command[1]){
          sensors.splice(i, 1);
          break;
        }
      }
      io.sockets.emit('update-msg', {data: getTableString()});
    }
    else if(command[0] == 'logmade'){
      getLogs();
    }
  });

  //ignore errors
  socket.on('error', function () {
  });

});

/**
*Returns string with all the connected nodes
*/
function getTableString() {
  var toReturn = '';

  sensors.forEach(function (s) {
    toReturn += s.getString() + '\n\r';
  })
  return toReturn;
}

/**
* Returns true if we have the node already in out table
* @param tosee
* @returns {boolean}
*/
function hasNode(tosee) {

  for (var i = 0; i < sensors.length; i++) {

    if (sensors[i].isequal(tosee))
    return true;
  }
  return false;
}

function sendCommandToNodes(command) {

  sensors.forEach(function (s) {
    s.socket.write(command);
  });
}

/**
* Sensor node data type
* @param hostname
* @param ip
* @param sensors
* @constructor
*/
function SensorNode(hostname, ip, sensors, want, socket) {
  this.hostname = hostname;
  this.ip = ip;
  this.sensors = want !== undefined ? sensors.split(':') : [];
  this.want = want !== undefined ? want.split(':') : [];
  this.socket = socket
}

/**node
* ToString for sensor node
* @memberof SensorNode
* @returns {string}
*/
SensorNode.prototype.getString = function () {
  return this.hostname + '-' + this.ip + '-' + (this.sensors.length == 0 ? '' : this.sensors) + '-' + (this.want.length == 0 ? '' : this.want);
};

/**
* Returns array of sensors that have something it wants
* @param node
* @returns {Array}
*/
SensorNode.prototype.getSensorsToSubTo = function () {
  var toReturn = [];
  const that = this;

  sensors.forEach(function (s) {

    for (var w = 0; w < that.want.length; w++) {

      if (s.sensors.indexOf(that.want[w]) >= 0 && (s.sensors.length !== 0) && (s.isequal(that) == false)) {
        toReturn.push(s);
        break;
      }
    }
  });

  return toReturn;
};

/**
* When a node joins the network it sees which other nodes want what the new one has and will send an update if it satisfies that condition
*/
SensorNode.prototype.getSensorsToPubTo = function () {
  const that = this;

  sensors.forEach(function (s) {

    for (var i = 0; i < s.want.length; i++) {

      if (that.sensors.indexOf(s.want[i]) >= 0 && (s.sensors.length !== 0) && (s.isequal(that) == false)) {
        s.socket.write('ct-' + that.getString() + '*');
        break;
      }
    }
  });
};

/**
* Equality between sensor nodes
* @param node
* @returns {boolean}
*/
SensorNode.prototype.isequal = function (node) {

  return (this.ip == node.ip) && (this.hostname == node.hostname);
}

SensorNode.prototype.getIP = function() {
  return this.ip;
}

//start listening for connections
server.listen(9999, '10.20.0.128');

/********************************************Website Code***************************************************/
const express = require('express');
const favicon = require('serve-favicon');
const app = express();
const path = require('path');
const scpClient = require('scp2');
const rimraf = require('rimraf')
const expressServer = app.listen(3000);
const zipFolder = require('zip-folder');

const os = require('os');

//create socket io for website to communicate with node server
var io = require('socket.io')(expressServer);


//stuff for styles
app.use(express.static(__dirname + '/'));
app.use(favicon(require('path').join(__dirname, '', 'favicon.ico')))

//called when the website is loaded
app.get('/', function (req, res) {

  //send the website code
  res.sendFile(__dirname + '/index.html')

  //update the table on refresh
  io.sockets.emit('update-msg', {data: getTableString()});
});

//look for a connection to the website socket
io.sockets.on('connection', function (socket) {

  socket.on('message', function(message){

    console.log(message);

    //filter commands from website
    if(message === 'shutdown'){
      sendCommandToNodes('shutdown');
    }
    else if (message === 'reboot') {
      sendCommandToNodes('reboot');
    }
    else if (message === 'refresh') {
      io.sockets.emit('update-msg', {data: getTableString()});
    }
    else if (message === 'logs') {
      sendCommandToNodes('logs');
    }

  });
})


//doesnt work :(
function getLogs() {

  fs.mkdir('allFiles', ()=>{});

  sensors.forEach(function (node) {

    fs.mkdir('allFiles/' + node.getIP(), ()=>{});
    scpClient.scp('root:cookiemonster@'+node.getIP()+':/home/root/.node_app_slot/logs/files.txt', 'allFiles/'+ node.getIP()+'/files.txt', ()=>{});

    setTimeout(function() {

      fs.readFile( 'allFiles/'+node.getIP()+'/files.txt', function (err, contents) {

        if(!err){
          contents.toString().split('\n').forEach(function (line) {
            console.log(line);

            scpClient.scp('root:cookiemonster@'+node.getIP()+':/home/root/.node_app_slot/logs/'+line, 'allFiles/' +node.getIP() +'/'+ line, ()=>{});

          });
        }
      });

      setTimeout(()=>{

        zipFolder(__dirname + '/allFiles', __dirname + '/data.zip', (err)=>{ });

      }, 45*1000);
    }, 5000);

  });

}

console.log('website at localhost:3000')
