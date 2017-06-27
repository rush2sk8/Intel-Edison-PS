Intel Edison Pub/Sub Network 
===================

This repo contains all the information necessary to setup and create a publish/subscribe network for Intel Edison boards, and monitor them. 


## Basic Usage
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

## Communication
----------------------

Nodes use the  [Master Node](https://github.com/rush2sk8/Intel-Edison-PS/tree/master/Master%20Node) to broker connections to each others. In order to have any communications between nodes you need to run the [Master Node](https://github.com/rush2sk8/Intel-Edison-PS/tree/master/Master%20Node).

In this example the node "Edison02" want to join the current network.

![Before](https://github.com/rush2sk8/Intel-Edison-PS/blob/master/images/beforejoining.PNG?raw=true )
 
 Edison02 will send its information (hostname, ip, has, wants) to the master node. The master node will see if any other nodes in the network has anything that Edison02 wants. In this example it sees that Edison03 has something that Edison02 so it will send Edison02 the information of Edison03 so that it can make a connection. After that it will see if the new node to the network has anything that the other nodes want. In this example every node wants the light sensor of Edison02 so the master node will update every other node with the information of this new node so that they all can subscribe to Edison02's topic.
This is what it looks like after Edison02 has successfully joined the network.


![After](https://github.com/rush2sk8/Intel-Edison-PS/blob/master/images/afterjoining.PNG?raw=true )


## MasterNodeConnection.js
--------------------------------
The main file that will broker and negotiate with the master node.

<b>Usage:</b>
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

### Methods

```JavaScript
master.publishDataToSubscribers (data)
```
Publishes <b>data</b> to every subscriber 

client.js
-------------

Used by ```MasterNodeConnection``` to create clients to subscribe to topics.
