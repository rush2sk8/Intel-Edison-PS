var fs = require('fs');
const hostname = require('os').hostname();

/**
 * Creates a server instance. The server is used to accept multiple incoming connections and to send data to those connections
 * @param {string} - ip ip address of server
 * @param {int} port - port to connect to
 * @param {int} timeout - The number of milliseconds of inactivity before a socket is presumed to have timed out. 0 will disable the timeout behavior
 * @constructor
 * @class
 * @example
 * var server = new Server('127.0.0.1', 1337, 0);
 */
function Server(ip, port, timeout) {
    this.ip = ip;
    this.port = port;
    this.server;
    this.seqnum = 0;
    this.log = []
    this.timeout = timeout
    this.connections = []
}

/**
 * Starts a server at the specified ip and port and listen for connections
 * @memberOf Server
 * @example
 * var server = new Server('127.0.0.1', 1337, 0);
 * server.start();
 */
Server.prototype.start = function () {
    var net = require('net');
    var that = this;

    this.server = net.createServer(function (socket) {

        //ignore random errors
        socket.on('error', function () {
        });

        //get data if any is recieved from the client TODO allow client to request hostname and other data from server
        socket.on('data', function (data) {
            var stringData = new Buffer(data).toString();

            if(stringData == 'hn'){
                socket.write('hn-'+hostname);
            }
        });

        //keep every socket to each client
        that.connections.push(socket);
    });

    //
    this.server.timeout = this.timeout;

    //listen for incoming connections
    this.server.listen(this.port, this.ip);

};

/**
 * Sends the data to all of the connected clients
 * @param {Object} data  - data to send to all the devices
 * @memberOf Server
 * @example
 * var server = new Server('127.0.0.1', 1337, 0);
 * server.start();
 *
 * //sends random data to connected clients every 5 seconds
 * setInterval(function(){
 *      server.sendUpdate(Math.random());
 * },5000);
 */
Server.prototype.sendUpdate = function (data) {
    var that = this;

    //write data to each saved socket
    this.connections.forEach(function (value) {

        //check if the socket is still alive
        if (value.address().address !== undefined) {

            //start the tx timer
            const start = process.hrtime();

            //write data to end device
            value.write(that.seqnum + ':' + data + '');

            //calculate tx time
            const timetaken = process.hrtime(start);

            //data to stringify
            const logData = {
                'txnode id': hostname,
                'sensorid': value.address().address,
                'seqnum': that.seqnum,
                'tx event time': timetaken
            };


            //store that data in an array
            that.log.push(JSON.stringify(logData));
        }
        //if its dead then remove it so we dont keep transmitting to a closed connection
        else {
            const i = that.connections.indexOf(value);
            if (i != -1)
                that.connections.splice(i, 1);

        }
    });

    //increment packet number
    this.seqnum++;
};

/**
 * Returns the sent data log from the server
 * @returns {Array} - Array of all the log data
 * @memberOf Server
 * @example
 * var server = new Server('127.0.0.1', 1337,0);
 * server.start();
 * ...
 * //gets the data logged by the server
 * var log = server.getTXLog();
 * console.log(log);
 */
Server.prototype.getTXLog = function () {
    return this.log;
};

/**
 * Removes data element from the server log
 * @param {String} toRemove - Element to remove
 * @memberOf Server
 * @example
 * var server = new Server('127.0.0.1', 1337,0);
 * server.start();
 * ...
 * var log = server.getTXLog();
 *
 * //deletes the first element from the log
 * server.deleteFromLog(log[0]);
 *
 */
Server.prototype.deleteFromLog = function (toRemove) {
    const i = this.log.indexOf(toRemove);
    if (i != -1) {
        this.log.splice(i, 1);
    }
};

/**
 * Writes the server log data to a file
 * @param {string} filename - name of the file to write to
 * @memberOf  Server
 * @example
 * var server = new Server('127.0.0.1', 1337,0);
 * server.start();
 *
 * setInterval(function () {
 *      server.sendUpdate(Math.random());
 *}, 1000);
 *
 * //will write data to a file called 'tx.log' every 5 seconds
 * setInterval(function () {
 *      server.writeLogToFile('tx.log');
 *}, 5000);
 */
Server.prototype.writeLogToFile = function (filename) {
    var that = this;
    this.log.forEach(function (data) {
        fs.appendFile(filename, data + '\r\n', function () {
            that.deleteFromLog(data);
        })
    });
};

module.exports = Server;
