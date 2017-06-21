## TODO's from Rushad
- [X] add push button

- [X] add automatic reconnect

~~[X] add max array sizecheck so they dont crash~~

- [X] add commands that each node can send other nodes


## Here are a list of capabilities (TODO's) from Rick:
- [X] Add abiity to transmit an event from one node to all nodes using Wi-Fi infrastructure mode.  We will get to ad-hoc later. 

- [X] Add event logging that allows measurement of latencies between the node.js application.  We don't care about the hop latencies but instead we care about the app layer to app layer latencies.  Event logging should include all information necessary to correlate transmitted events on one node to received events on the other.

- [X] Add the ability to reset the counters on all nodes by command from a PC 

- [X] Add the ability to reboot all nodes in the network by command from a PC

- [ ] Add abilty to inject a repeating psuedo-random pattern of 1's and 0's from a file as events that are transmitted to other nodes.  That is, each 1 and 0 is an independent event.  Each event should be separated by a configurable amount of time between 10 and 1000 milliseconds.

- [X] Cleanup code so that it is more re-entrant and re-usable.  B U Z Z W O R D S

- [X] Document the code in the GitHub repository. 

- [ ] Present your design.

- [~] Add adhoc configuration capability
