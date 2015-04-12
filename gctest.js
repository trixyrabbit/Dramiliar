var gc = require('./gamecube_device.js');

var controller = gc(function(controller){
	controller.on('buttonChange', function(data){
		console.log(data.button + ': ' + data.value);
	});
});





