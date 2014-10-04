var myQ = require("./myQ.js").myQ;
var Promise = require('es6-promise').Promise;


myQ.getDevices('<userid>','<password>')
	.then(function(respObj){
					console.log(respObj);
				},
				function(respObj){
					console.log("Unsucessful"+respObj);
				}
	);


myQ.getDoorStatus('<userid>','<password>','<deviceId>')
	.then(function(state){
		 console.log("Current State:"+state);
	});


/*
myQ.openDoor('<userid>','<password>','<deviceId>')
	.then(function(state){
					console.log("Sucessfully completed!"+state)
			  },
				 function(state){
					console.log("unscessful"+state)
   			}
	 );

*/
/*
myQ.closeDoor('<userid>','<password>','<deviceId>')
	.then(function(state){
					console.log("Sucessfully completed!"+state)
			  },
				 function(state){
					console.log("unscessful"+state)
   			}
	 );
*/

