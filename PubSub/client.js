var fs = require('fs');
const hostname = require('os').hostname();


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
function Client(ip, port, dataHandler) {
    var n = require('net');
    this.client = new n.Socket();
    this.connHN = '';
    this.ip = ip;
    this.myIP = getIPAddress();     
    this.port = port;  
    this.log = []
    this.dh = dataHandler;
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
    var that = this;
 
    /**
     * connects to the endpoint
     * @memberOf Client.prototpye
     * */
    this.client.connect(this.port, this.ip, function () {
        console.log('connected to: ' + that.ip + ' !');
    });

    /**
     *  Callback when data is received
     *  @memberOf Client.prototpye
     * */
    this.client.on('data', function (data) {

        //converts TCP stream data to a string
        const stringData = (new Buffer(data)).toString();

        //splits the data at the :
        const dataArray = stringData.split(':');

        //if non formatted data or hostname data is received dont log it
        if (dataArray.length == 2) {

            var logData = {
                'rxnode id': hostname,
                'rxnode ip': that.myIP,
                'tx node id': that.connHN,
                'tx node ip': that.ip,
                'rxtime': (new Date()),
                'seqnum': dataArray[0],
                'data': dataArray[1]
            };


            //push the data to out log 
            that.log.push(JSON.stringify(logData));

            //if the user defined a handler function send the string data to the function
            if (that.dh !== undefined) {
                that.dh(stringData);
            }

        }
        //otherwise its a command
        else {
            var command = stringData.split('-');

            if (command[0] == 'hn') {
                that.connHN = command[1];
            } else if (command[0] == 'gni') {
                that.client.write('ghn-' + hostname + '-' + that.myIP); //deprecated
            }

        }

    });

    /** Called when the socket has successfully closed
     *  @memberOf Client.prototpye
     **/
    this.client.on('close', function () {
        console.log(that.ip + ' closed')
        that.client.destroy();
        that.client.unref();

        setTimeout(function () {
            that.client.connect(this.port, this.ip, function () {
                that.client.write('hn');
            });

        }, 5000);


    });

    /**Called when an error like a refused connection, broken pipe, broken socket, etc has occured
     * Notice when this is called the client class is broken
     * @memberOf Client.prototpye
     * */
    this.client.on('error', function () {
        console.log('error on: ' + that.ip);
        /* that.client.destroy(); 
         that.client.unref();

         setTimeout(function () {
         that.client.connect(this.port, this.ip, function () {
         that.client.write('hn');
         });

         }, 5000);*/

    });

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
 * Deletes an entry from the log
 * @param {string} toRemove - entry to remove
 * @memberOf Client
 * @example
 * var client = new Client('127.0.0.1', 1337,function(){});
 * client.start();
 * ...
 * var log = client.getRXLog();
 *
 * //deletes the first element from the log
 * client.deleteFromLog(log[0]);
 */
Client.prototype.deleteFromLog = function (toRemove) {
    const i = this.log.indexOf(toRemove);
    if (i != -1) {
        this.log.splice(i, 1);
    }
}

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
    this.log.forEach(function (data) {
        fs.appendFile(filename, data + '\r\n', function () {
            that.deleteFromLog(data);
        })
    });
};


Client.prototype.getClientSocket = function () {
    return this.client;
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

/**************************************************END MAIN**************************************************/