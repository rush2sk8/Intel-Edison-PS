var sensors = [];

var conns = [];
var express = require('express');
var app = express();
var http = require('http');
var net = require('net');

app.use(express.static(__dirname + '/'));

app.get('/', function (req, res) {
    var html = '<!DOCTYPE html>' +
        ' <html>' +
        ' <head>' +
        '<title>Edison Control Center</title>' +
        '<link rel="stylesheet" href="style.css">' +
        '    </head>' +
        '  <body>' +
        '   <header>' +
        ' <h1>Edison Control Center</h1>' +
        '</header>' +
        ' <div class="container">' +
        '    <div class="main-content">' +

        '  <div id="table">' +
        '<table cellpadding="14"cellspacing="14">';
    html += '<tr><th>Sensor ID</th><th>Sensor IP</th></tr>';

    sensors.forEach(function (s) {

        html += '<tr>';
        html += '<th>' + s[0] + '</th>';
        html += '<th>' + s[1] + '</th>';
        html += '</tr>';
    });

    html += '</table>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<footer>' +
        '<p>© 2017 Rushad Antia</p>' +
        '</footer>' +
        '</body>' +
        ' </html>';
	discoverNodes();
	
	res.send(html);
		
   
	
});

app.listen(3000, function () {
    console.log('Website running at localhost:3000');
});


var server = net.createServer(function (socket) {

    socket.on('data', function (data) {
        var stringData = new Buffer(data).toString();
        var command = stringData.split('-');

        if(command[0] == 'ghn')
            sensors.push([command[1],command[2]])

		console.log(stringData);

    });
	
	socket.on('error', function(){});

   conns.push(socket);
});


server.listen(9999, '10.20.0.128');

function discoverNodes() {

    sensors.length = 0;

    conns.forEach(function (con) {

        //check if the socket is still alive
        if (con.address().address !== undefined) {
            con.write('gni-');
        }
        else {
            const i = conns.indexOf(con);
            if (i != -1)
                conns.splice(i, 1);

        }
    });

}
discoverNodes();

