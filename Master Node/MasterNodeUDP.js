var sensors = []

var dgram = require('dgram')

var server = dgram.createSocket('udp4')

server.on('listening', function(){
  const address = server.address()
  console.log('listening on ' + address.address + ':' + address.port)
});

server.on('message', function(message, remote){

  console.log(message)

  //split it by the delimiter
  const command = message.split('-');

  //if the command new node is requested
  if (command[0] == 'nn') {

    //create a new sensor node object
    var sn = new SensorNode(command[1], command[2], command[3], command[4]);

    //check to see if the node is already in the list
    if (hasNode(sn) === false) {
      sensors.push(sn);
    }

    sn.getSensorsToSubTo().forEach(function (s) {
      var client = dgram.createSocket('udp4')
      const message = 'ct-' + s.getString() + '*';

      client.send(message, 0 , message.length, 9999, s.ip, function(err, bytes){
        if(err)
        console.log('err sending message');
        client.close()
      });

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

  }
});

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


/**
* Sensor node data type
* @param hostname
* @param ip
* @param sensors
* @constructor
*/
function SensorNode(hostname, ip, sensors, want) {
  this.hostname = hostname;
  this.ip = ip;
  this.sensors = want !== undefined ? sensors.split(':') : [];
  this.want = want !== undefined ? want.split(':') : [];
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
        var client = dgram.createSocket('udp4')
        const message = 'ct-' + s.getString() + '*';

        client.send(message, 0 , message.length, 9999, s.ip, function(err, bytes){
          if(err)
          console.log('err sending message');
          client.close()
        });

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

server.on('error', function(){console.log('error')});

server.bind(9999, '10.20.0.128');
