Intel Edison Pub/Sub Network 
===================

This repo contains all the information necessary to setup and create a publish/subscribe network for Intel Edison boards, and monitor them. 


Usage
-------------

```JavaScript 
const MasterNodeConnection = require('./MasterNodeConnection.js')

var dh = function(data){
	console.log(data)
}
 
const master = new MasterNodeConnection('ip', port, 'has:these:sensors', 'wants:these:sensors', dh)

master.startAutomaticDiscovery()
```

