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
  sortTable();
});

$('#logs').click(function () {
  socket.emit('message', 'logs')

   var x = document.getElementById("snackbar")

   x.className = "show";

   setTimeout(function(){ x.className = x.className.replace("show", ""); }, 45000);
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
  sortTable();
});

document.getElementById("refresh").click();

//sort table function from w3schools
function sortTable() {
  var table, rows, switching, i, x, y, shouldSwitch;
  table = document.getElementById("nodeTable");
  switching = true;

  while (switching) {

    switching = false;
    rows = table.getElementsByTagName("tr");

    for (i = 1; i < (rows.length - 1); i++) {

      shouldSwitch = false;

      x = rows[i].getElementsByTagName("td")[0];
      y = rows[i + 1].getElementsByTagName("td")[0];


      if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
        shouldSwitch= true;
        break;
      }
    }
    if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
    }
  }
}
