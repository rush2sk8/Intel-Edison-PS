var socket = io.connect('http://localhost:3000');
$('#reboot').click(function() {
  socket.emit('message', 'reboot')
  alert("Reboot command sent to all active nodes")

  document.getElementById("reboot").disabled = true;

  setTimeout(function(){
    document.getElementById("reboot").disabled = false;

  }, 60*1000);

})

$('#shutdown').click(function() {
  socket.emit('message', 'shutdown');
  alert("shutdown command sent to all active nodes")

  document.getElementById("shutdown").disabled = true;

  setTimeout(function(){
    document.getElementById("shutdown").disabled = false;
  }, 60*1000);
})

$('#refresh').click(function(){
  $('#refresh').hide();
  socket.emit('message', 'refresh');
});

socket.on('update-msg', function (msg) {
  var htmlTable = '<table>'
  +'<tr>'
  + '<th> Sensor Name </th>'
  + '<th> IP Address </th>'
  + '<th> Sensors Have </th>'
  + '<th> Sensors Want </th>'
  + '</tr>';

  msg.data.split('\n').forEach(function(sensor) {

    const data = sensor.split('-');
    if(data.length === 4){
      const html =
      '<tr>'
      + '<td>' + data[0] + '</td>'
      + '<td>' + data[1] + '</td>'
      + '<td>' + data[2] + '</td>'
      + '<td>' + data[3] + '</td>'
      + '</tr>';
      htmlTable += html;
    }
  });

  htmlTable += '</table>';
  $('#main').html(htmlTable);
});

document.getElementById("refresh").click();
