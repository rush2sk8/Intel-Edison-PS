var net = require('net');
var client = new net.Socket();
var num = Math.random();

client.connect(1337, '127.0.0.1', function(){

	client.write(''+num);
	
});

client.on('data', function(data){
	
	console.log('Data from server: ' + data);
	setTimeout(function(){
		client.destroy();
	}, 3000);
 
});
client.on('close', function(){
	console.log(num + ' closed')
});

