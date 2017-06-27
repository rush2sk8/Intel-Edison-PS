Intel Edison Pub/Sub Network 
===================

This repo contains all the information necessary to setup and create a publish/subscribe network for Intel Edison boards, and monitor them. 


Usage
-------------

```JavaScript 
const MasterNodeConnection = require('./MasterNodeConnection.js')

//handles the data from topics it is subbed to
//data format: seqnum:data
var dh = function(data){
	console.log(data)
}

const master = new MasterNodeConnection('ip', port, 'light:temp', 'button:light', dh)

master.startAutomaticDiscovery()
```
Each user will be provisioned with what sensors they have and what they want delimited by a colon. The above snippet initializes a node with the sensors light & temp, while it wants to subscribe to any node with button or light. It will print any incoming data to the console.

Communication
----------------------

Nodes use the  [Master Node](https://github.com/rush2sk8/Intel-Edison-PS/blob/master/Master%20Node/MasterNode.js) to broker connections to each others. In order to have any communications between nodes you need to run the [Master Node](https://github.com/rush2sk8/Intel-Edison-PS/blob/master/Master%20Node/MasterNode.js)

```sequence
Alice->Bob: Hello Bob, how are you?
Note right of Bob: Bob thinks
Bob-->Alice: I am good thanks!
```
