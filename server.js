//tcp server

const ip = '127.0.0.1';
const port = 1337;


//client class
function Client(ip, port) {
    var n = require('net');
    this.client = new n.Socket();
    this.ip = ip;
    this.port = port;
}

//connects to endpoint and sends a number to it
Client.prototype.run = function () {

    this.client.connect(this.port, this.ip, function () {

        this.write('' + Math.random());
    });

    this.client.on('data', function (data) {

        console.log('Data from server: ' + data);
        var d = this;
        setTimeout(function () {
            d.destroy();
        }, 3000);
    });

    this.client.on('close', function () {
        console.log('local closed')
    });

    this.client.on('crror', function () {
       console.log('error on client');
    });
};


function Server(ip, port) {
    this.ip = ip;
    this.port = port;
    this.server;

}
Server.prototype.start = function () {
    var net = require('net');

    this.server = net.createServer(function (socket) {
        socket.write('Server: ' + 60 + '\r\n');
        socket.pipe(socket);
        socket.on('error', function () {});

        socket.on('data', function (data) {
            console.log((new Buffer(data)).toString());
        });
    });
    this.server.timeout = 0;
    this.server.listen(this.port, this.ip);
};


(new Server(ip, port)).start();
setTimeout(function () {
    (new Client(ip, port)).run();
},3000);


