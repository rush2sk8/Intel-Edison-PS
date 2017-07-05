/*Website code*/
var socket = io.connect('http://localhost:3000');

$('#reboot').click(function() {

  const r = confirm("Are you sure?")

  if(r == true){
    socket.emit('message', 'reboot')
    alert("Reboot command sent to all active nodes")
    document.getElementById("reboot").disabled = true;

    setTimeout(function(){
      document.getElementById("reboot").disabled = false;

    }, 60*1000);
  }
})

$('#shutdown').click(function() {

  const r = confirm("Are you sure?")
  if(r == true){
    alert("Shutdown command sent to all active nodes")
    socket.emit('message', 'shutdown');
    document.getElementById("shutdown").disabled = true;

    setTimeout(function(){
      document.getElementById("shutdown").disabled = false;
    }, 60*1000);
  }
})

$('#refresh').click(function(){
  $('#refresh').hide();
  socket.emit('message', 'refresh');

});

$('#logs').click(function () {
  socket.emit('message', 'logs')

   var x = document.getElementById("snackbar")

   x.className = "show";

   setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
});

$('#delLogs').click(function(){
  const r = confirm("Are you sure?")
  if(r == true){
    alert("Deleted log files on all Nodes")

     socket.emit('message', 'delLogs');
  }

});

socket.on('update-msg', function (msg) {
  var htmlTable = '<table id="nodeTable">'
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

socket.on('test', function (msg) {
  console.log('Current Test Running: ' + msg.data)
  $('#test').html('<p>Current Test: ' + msg.data+ '</p>');
});

socket.on('d-zip', (msg)=>{
  window.location = 'logs.zip'
});

socket.on('nologs', (msg)=>{
  alert('No logs are available');
});

document.getElementById("refresh").click();
