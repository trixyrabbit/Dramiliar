var gc = require('./gamecube_device.js');

var controller = gc('/dev/hidraw2', function(controller){
	controller.on('buttonChange', function(data){
		console.log(data.button + ': ' + data.value);
	});
});





