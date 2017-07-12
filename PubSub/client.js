var fs = require('fs');
const hostname = require('os').hostname();
const net = require('net');
const nanotime = require('nano-time');

/**
* creates a client object which will make a connection to an endpoint
* @param {string} - ip ip address of server
* @param {int} port - port to connect to
* @param {function} dataHandler - a function that the client will send data to should be in format function(data){} where data is a {string}
* @constructor
* @class
* @example
*
* //handles the data that the client receives from the server
* var dh = function(data){
*
*      //prints received data to the screen
*      console.log(data);
* };
*
* //creates a client that will connect to a server running on the localhost
* var client = new Client('127.0.0.1', 1337, dh);
*/
function Client(ip, port, dataHandler, mnc) {
  this.connHN = '';
  this.ip = ip;
  this.myIP = getIPAddress();
  this.port = port;
  this.log = [];
  this.dh = dataHandler;
  this.mnc = mnc;

  fs.stat('logs/', function (err, stats) {
    if(err){
      return fs.mkdirSync('logs/')
    }
  });

  this.log.push('start time: '+ nanotime.micro())
  this.log.push('hostname, rxnode ip, txnode ip, rxtime, txtime, seqnum, data, bytes recieved')
}

/**
* This function will start a connection to the endpoint given the
* ip and port that the client object was initialized with.
* It also logs all recieved data before sending it to the data handler
* if it was set by the user.
* @memberOf Client
* @example
* var client = new Client('127.0.0.1', 1337, function(){});
* client.run();
*/
Client.prototype.run = function () {
  const that = this;

  //client socket
  var client = new net.Socket();

  //put the connect in its own function so that we reconnect if needed
  var clientConn = function(){

    client = new net.Socket();
    /**
    * connects to the endpoint
    * @memberOf Client.prototpye
    * */
    client.connect(that.port, that.ip, function () {
      console.log('connected to: ' + that.ip + ' !');
    });

    /**
    *  Callback when data is received
    *  @memberOf Client.prototpye
    * */
    client.on('data', function (data) {
      //const t = nanotime.micro();

      const buf = new Buffer(data);

      //converts TCP stream data to a string
      const stringData = buf.toString();

      //splits the data at the :
      const dataArray = stringData.split(':');

      //if non formatted data or hostname data is received dont log it
      if (dataArray.length == 3) {

        //push the data to out log
        //that.log.push(hostname + ','+that.myIP+ ','+that.ip+ ','+t+ ','+dataArray[1]+ ','+dataArray[0] + ',' + dataArray[2] + ',' + buf.length)

        //if the user defined a handler function send the string data to the function
        if (that.dh !== undefined)
        that.dh(stringData);

      }
      //otherwise its a command
      else {
        var command = stringData.split('-');

        //save the hostnam
        if (command[0] == 'hn') {
          that.connHN = command[1];
        }
      }
    });

    /** Called when the socket has successfully closed
    *  @memberOf Client.prototpye
    **/
    client.on('close', function () {
      console.log('lost connection to ' + that.ip + ' retrying...');
      client.destroy();

      //uncomment if you want the master node to know when a connection is dropped
      if (that.mnc !== undefined)
      that.mnc.write('cld-' + that.ip);

      setTimeout(clientConn, 1000);
    });

    /**Called when an error like a refused connection, broken pipe, broken socket, etc has occured
    * Notice when this is called the client class is broken
    * @memberOf Client.prototpye
    * */
    client.on('error', function () {
    });
  }

  //run the initial connection
  clientConn();
};

/**
* Will return the array contaning all of the logged data
* @returns {Array} all of the rx data
* @memberOf Client
* @example
* var client = new Client('127.0.0.1', 1337, function(){});
* client.run();
*
* //gets the received data log
* var log = client.getRXLog();
* console.log(log);
*/
Client.prototype.getRXLog = function () {
  return this.log;
};


/**
* Writes the entire log to a file specified by "filename" then clear the log
* Note this will append the data to that file
* @param {string} filename  - name of the file you want to append to. if it doesnt exist it will be created
* @memberOf Client
* @example
* var client = new Client('127.0.0.1', 1337, function(){});
* client.run();
*
* //writes data called rx.log every 5 seconds
* setInterval(function () {
client.writeLogToFile('rx.log');
* }, 5000);
*/
Client.prototype.writeLogToFile = function (filename) {
  var that = this;

  //make sure the aray isnt empty
  if(this.log.length > 2){
    this.log.forEach(function (data) {
      fs.appendFileSync(__dirname + '/logs/'+filename, data + '\r\n');
    });
  }
};

/**
*Returns the IP of the connection
*@returns ip
*/
Client.prototype.getIP = function () {
  return this.ip;
}

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

module.exports = Client;
