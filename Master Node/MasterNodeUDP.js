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
          var sn = new SensorNode(command[1], command[2], command[3], command[4], socket);

          //check to see if the node is already in the list
          if (hasNode(sn) === false) {
              sensors.push(sn);
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

  }
});

server.on('error', function(){console.log('error')});

server.bind(9999, '10.20.0.128');
