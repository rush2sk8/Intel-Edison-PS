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
* @param {SensorNodenode
* @returns {boolean}
*/
SensorNode.prototype.isequal = function (node) {

  return (this.ip == node.ip) && (this.hostname == node.hostname);
}

/**
* Returns the IP of the sensor node
* @return {string} the ip address
*/
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
const rimraf = require('rimraf')
const expressServer = app.listen(3000);
const zipFolder = require('zip-folder');
const platform = require('os').platform();

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
      rimraf(__dirname+'/logs', (err)=>{})
      rimraf(__dirname+'/logs.zip', (err)=>{})
      getLogs();
    }
    else if(message === 'delLogs'){
      sendCommandToNodes('delLogs');
      console.log('sent command to delLogs');
    }

  });
})

/**
* Runs scp commands to get the log folders from all the sensor nodes
*
*/
function getLogs() {

  var i = 0;

  //get around way to make synchnonous code
  var runSCP = function () {

    //pseudo for loop
    if(i < sensors.length){
      //exec a child process to scp the logs from a device
      const exec = require('child_process').exec;

      //check which version of scp to use
      if(platform === 'win32'){
        scp = exec('pscp -r -scp -pw cookiemonster root@'+sensors[i].getIP()+':/home/root/.node_app_slot/logs .' )
      }
      else {
        scp = exec('sshpass -p \'cookiemonster\' scp -r  root@'+sensors[i].getIP()+':/home/root/.node_app_slot/logs .')
      }

      //log data into console
      scp.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
      });

      //when the command is finished make it scp the next node
      scp.on('close', (code) => {
        i++;
        runSCP();
      });

    }else{

      //if we are empty dont zip nothing
      if(sensors.length !== 0){

        //zip the logs of everyone
        zipFolder(__dirname + '/logs', __dirname + '/logs.zip', (err) => {
          //emit the message to pickup what they want
          if(!err)   io.sockets.emit('d-zip', {data:''});
        });
      }else{
        //otherwise tell the user that there are no logs
        io.sockets.emit('nologs', {data:''});
      }
      console.log('done');
    }
  }

  //start the for loops
  runSCP();

}

console.log('website at localhost:3000')
