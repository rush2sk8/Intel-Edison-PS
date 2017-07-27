Master Node
===================

The master node is the program that is run on a computer that is meant to broker connections between nodes and it simultaneously acts as a web-server that hosts a node monitoring website. 

## Installation

```bash
$ npm install 
```

## Usage

```bash
$ node MasterNode.js
```

Runs the MasterNode broker and allows to access a website that monitors the nodes ```localhost:3000```.

## Website 

![Site](https://github.com/rush2sk8/Intel-Edison-PS/blob/master/Documentation/images/site.png?raw=true)

Allows you to see which nodes are connected to the MasterNode. If they disconnect you will see the website update automatically without refreshing it. 

 - **Shutdown All Nodes** - Sends the ```shutdown -h now ``` command to all the connected nodes
 - **Reboot All Nodes** - Sends the ```reboot``` command to the nodes. Keep in mind that it might not restart the program at launch depending on how the nodes are configured
 - **Delete Logs on Nodes** - Deletes all the logs stored on the nodes
 - **Download Logs** - Gathers all the log files from each node through scp. Then it will zip them and allow the user to download them.

## Website Demo
![demo](https://github.com/rush2sk8/Intel-Edison-PS/blob/master/Documentation/images/website%20demo.gif?raw=true)

## Download Logs Demo
![logs](https://github.com/rush2sk8/Intel-Edison-PS/blob/master/Documentation/images/logscom.gif?raw=true)
