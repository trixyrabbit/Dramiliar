var arDrone = require('ar-drone');
var client  = arDrone.createClient();

client.stop();
setTimeout(function(){
	client.stop();
	client.land();
	console.log('Stopped!');
}, 2000);
