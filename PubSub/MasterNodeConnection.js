const Client = require('./client.js');
const Server = require('./server.js');
const net = require('net');
const nanotime = require('nano-time');
/**
*
* @param ip -- ip address of the master node
* @param port -- port of the master node
* @param mysensors -- list of sensors that  i have delimited my a colon ex- 'light:smoke:co2'
* @param want -- list of sensors i want delimited by a colon
* @param dh -- clientside data handler
* @constructor
* @example
* var master = new MasterNodeConnection('10.20.0.128', 9999, 'light:', '', dh);
*/
function MasterNodeConnection(ip, port, mysensors, want, dh) {
  this.ip = ip;
  this.port = port;
  this.mySensors = mysensors;
  this.myIP = getIPAddress();
  this.want = want;
  this.clients = [];
  this.server;
  this.dh = dh;
  this.logging = true;
  this.filename;
}

/**
* Starts the discovery and connection service
* @example
* var master = new MasterNodeConnection('10.20.0.128', 9999, 'light:', '', dh);
* master.startAutomaticDiscovery();
*/
MasterNodeConnection.prototype.startAutomaticDiscovery = function () {
  const that = this;
  this.server = new Server(this.myIP, 1337, 0);

  //start the server on the device
  this.server.start();

  //master connection
  var clientConnToMN = new net.Socket();


  //function to connect to the Master Node
  var startClientConn = function() {

    //create a socket connection
    clientConnToMN = new net.Socket();

    //make the connection
    clientConnToMN.connect(that.port, that.ip, function () {
      this.write('nn-' + (require('os').hostname()) + '-' + that.myIP + '-' + that.mySensors + '-' + that.want);
      //console.log('Connected to MN')
    });

    //handle the actual pub/sub creation
    clientConnToMN.on('data', function (data) {

      //put data into a string
      const stringData = (new Buffer(data)).toString();
      //console.log(stringData);

      stringData.split('*').forEach(function (node) {

        //split the command
        var command = node.split('-');

        //if the command is a new node in the network
        if (command[0] === 'ct') {

          var isConnected = false;

          //check if we are already connected to this node
          that.clients.forEach(function (c) {

            if(c.getIP() === command[2])
            isConnected = true;

          });

          //if we are already connected then dont make another connection to it
          if(!isConnected){

            //create a new client
            var newClient = new Client(command[2], 1337, that.dh);

            // the client connection
            newClient.run();

            //keep a track of ongoing connections
            that.clients.push(newClient);
          }

          //console.log('connected to: ' + command[1]);
        }

        //reboot command is requested
        else if (command[0] === 'reboot') {
          closeGracefully();

          //reboot
          setTimeout(function () {
            require('child_process').exec('reboot');
          }, 2000);
        }

        //shutdown command is requested
        else if(command[0] === 'shutdown'){
          closeGracefully();

          //shutdown
          setTimeout(function () {
            require('child_process').exec('shutdown -h now');
          }, 2000);
        }

        else if(command[0] === 'delLogs'){
          require('child_process').exec('rm -rf logs');
        }

        else if(command[0] === 'fn'){
          that.filename = command[1];
        }
      });
    });

    //ignore errors
    clientConnToMN.on('error', ()=>{});

    //if error is thrown this will be called and will handle a reconnect to the MN
    clientConnToMN.on('close', function () {
      clientConnToMN.destroy();

      setTimeout(startClientConn(), 1000);
      //console.log('Connection to MN lost retrying...')
    });

  };

  //start the connection
  startClientConn();

  var closeGracefully = function () {

    //console.log('fname: ' + that.filename);

    if(that.logging === true){

      //write the tx data to a log file
      that.server.writeLogToFile(that.myIP+'_'+ that.filename + '_tx.csv');

      //write all the rx logs to a file
      that.clients.forEach(function (c) {
        c.writeLogToFile(that.myIP+'__'+c.ip + '_'+ that.filename + '_rx.csv');
      });

    }
    //tell the MN that we have closed
    clientConnToMN.write('cld-' + require('os').hostname() + '-' + that.myIP);

  };


  //handle exits
  process.on('SIGINT', function () {

    //write data to files before exiting
    closeGracefully();

    //wait b4 exiting
    setTimeout(function () {
      process.exit();
    }, 1000);

  });

};

/**
* Push data to all the subscribed connections
* @param data
*/
MasterNodeConnection.prototype.publishDataToSubscribers = function (data) {
  this.server.sendUpdate(data);
};

/**
* Helper function that returns the ip of THIS device
* @returns {String}
*/
function getIPAddress() {
  var interfaces = require('os').networkInterfaces();
  for (var devName in interfaces) {
    var iface = interfaces[devName];

    for (var i = 0; i < iface.length; i++) {
      var alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
      return alias.address;
    }
  }

  return '0.0.0.0';
}

/*
* Enables or disables logging. Set as true by default
*
* @param logging - true if you want to enable logging
*/
MasterNodeConnection.prototype.setLogging = function (logging) {
  this.logging = logging;
}

//NodeJS thing so that i can make this a class
module.exports = MasterNodeConnection;
