/**Rushad Antia**/
'use strict';
//TODO JSDOC add push button to affect all the other


var fs = require('fs');
const hostname = require('os').hostname();

/**
 * creates a client object which will make a connection to an endpoint
 * @param {string} - ip ip address of server
 * @param {int} port - port to connect to
 * @param {function} dataHandler - a function that the client will send data to should be in format function(data){} where data is a {string}
 * @constructor
 * @class
 */
function Client(ip, port, dataHandler) {
    var n = require('net');
    this.client = new n.Socket();
    this.connHN = '';
    this.ip = ip;
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
 */
Client.prototype.run = function () {
    var that = this;

    /**
     * connects to the endpoint
     * @memberOf Client.prototpye
     * */
    this.client.connect(this.port, this.ip);

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
        if (dataArray.length > 1) {
            const logData = {
                'rxnode id': hostname,
                'rxnode ip': ip,
                'rxtime': (new Date()),
                'seqnum': dataArray[0],
                'data': dataArray[1]
            };

            //push the data to out log
            that.log.push(JSON.stringify(logData));

            //log the data to the screen
            console.log(logData);

            //if the user defined a handler function send the string data to the function
            if (that.dh !== undefined)
                that.dh(stringData);
        }
    });

    /** Called when the socket has successfully closed
     *  @memberOf Client.prototpye
     **/
    this.client.on('close', function () {
        console.log(this.ip + ' closed')
    });

    /**Called when an error like a refused connection, broken pipe, broken socket, etc has occured
     * Notice when this is called the client class is broken
     * @memberOf Client.prototpye
     * */
    this.client.on('error', function () {
        console.log('error on' + this.ip);
    });

};
/**
 * Will return the array contaning all of the logged data
 * @returns {Array}
 * @memberOf Client
 */
Client.prototype.getRXLog = function () {
    return this.log;
};

/**
 * Deletes an entry from the log
 * @param toRemove
 * @memberOf Client
 */
Client.prototype.deleteFromLog = function (toRemove) {
    const i = this.log.indexOf(toRemove);
    if (i != -1) {
        this.log.splice(i, 1);
    }
}

/**
 * Writes the entire log to a file specified by @param {filename} then clear the log
 * Note this will append the data to that file
 * @param filename
 * @memberOf Client
 */
Client.prototype.writeLogToFile = function (filename) {
    var that = this;
    this.log.forEach(function (data) {
        fs.appendFile(filename, data + '\r\n', function () {
            that.deleteFromLog(data);
        })
    });
};

/**
 * Creates a server instance. The server is used to accept multiple incoming connections and to send data to those connections
 * @param {string} - ip ip address of server
 * @param {int} port - port to connect to
 * @param {int} timeout - The number of milliseconds of inactivity before a socket is presumed to have timed out. 0 will disable the timeout behavior
 * @constructor
 * @class
 */
function Server(ip, port,timeout) {
    this.ip = ip;
    this.port = port;
    this.server;
    this.seqnum = 0;
    this.log = []
    this.timeout  = timeout
    this.connections = []
}

/**
 * Create a server at the specified ip and port and listen for connections
 * @memberOf Server
 */
Server.prototype.start = function () {
    var net = require('net');
    var that = this;

    /**
     * Opens a server on the ip and port
     */
    this.server = net.createServer(function (socket) {

        //write server hostname to client
        socket.write(hostname + ':');

        //ignore random errors
        socket.on('error', function () {
        });

        //get data if any is recieved from the client TODO allow client to request hostname and other data from server
        socket.on('data', function (data) {
            console.log((new Buffer(data)).toString());
        });

        //keep every socket to each client
        connections.push(socket);
    });

    //
    this.server.timeout = this.timeout;

    //listen for incoming connections
    this.server.listen(this.port, this.ip);

};

/**
 * Sends the data to all of the connected clients
 * @param data {} - data to send to all the devices
 * @memberOf Server
 */
Server.prototype.sendUpdate = function (data) {
    var that = this;

    //write data to each saved socket
    connections.forEach(function (value) {

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

            //print the data
            console.log(logData);

            //store that data in an array
            that.log.push(JSON.stringify(logData));
        }
        //if its dead then remove it so we dont keep transmitting to a closed connection
        else {
            const i = that.connections.indexOf(value);
            if (i != -1)
                connections.splice(i, 1);

        }
    });

    //increment packet number
    this.seqnum++;
};

/**
 * Returns the sent data log from the server
 * @returns {Array}
 * @memberOf Server
 */
Server.prototype.getTXLog = function () {
    return this.log;
};

/**
 * Removes data element from the server log
 * @param toRemove
 * @memberOf Server
 */
Server.prototype.deleteFromLog = function (toRemove) {
    const i = this.log.indexOf(toRemove);
    if (i != -1) {
        this.log.splice(i, 1);
    }
};

/**
 * Writes the server log data to a file
 * @param filename
 * @memberOf  Server
 */
Server.prototype.writeLogToFile = function (filename) {
    var that = this;
    this.log.forEach(function (data) {
        fs.appendFile(filename, data + '\r\n', function () {
            that.deleteFromLog(data);
        })
    });
};



/****************************************************MAIN****************************************************/
const ip = '127.0.0.1';
const port = 1337;



/**************************************************END MAIN**************************************************/