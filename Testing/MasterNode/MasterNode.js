var sensors = [];
sensors.push(['edison02','10.20.0.11']);
sensors.push(['edison03', '10.20.0.12']);
console.log(sensors);
var express = require('express'),
    app = express(),
    http = require('http');

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

    res.send(html);
});

app.listen(3000, function () {
    console.log('Website running at localhost:3000');
});
