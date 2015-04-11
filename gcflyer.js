var gc = require('./gamecube_device.js');
var arDrone = require('ar-drone');
var client  = arDrone.createClient();

var in_air = false;
var emergency = false;
var speed_yaw = 0;
var speed_pitch = 0;
//var speed_roll = 0; //we never roll
var speed_vert = 0;

function getStickSpeed(value){
	var speed = 0;
	if(value < 100)
		speed = -((100-value)/100);
	if(value > 148)
		speed = (value-148)/100;

	return speed;
}

function stopMovement(){
	if(speed_vert == 0 && speed_pitch == 0 && speed_yaw == 0){
		client.stop();
	}
}
gc(function(controller){
	controller.on('buttonChange', function(data){

		if(data.button == 'a' && data.value == 1){

			client.land();
			emergency = true;
			console.log('EMERGENCY LANDING');
		}
		if(!emergency){
			if(data.button == 'start' && data.value == 1){
				if(in_air){
					client.land();
					console.log('Landing');
					in_air = false;
				}else{
					client.takeoff();
					console.log('Taking off!');
					in_air = true;
				}
			}

			if(data.button == 'stick_x'){
				speed_yaw = getStickSpeed(data.value);
				if(speed_yaw == 0)
					stopMovement();
				if(speed_yaw > 0)
					client.right(speed_yaw);
				if(speed_yaw < 0)
					client.left(-speed_yaw);
			}

			if(data.button == 'stick_y'){
				speed_pitch = getStickSpeed(data.value);
				if(speed_pitch == 0)
					stopMovement();
				if(speed_pitch > 0)
					client.front(speed_pitch);
				if(speed_pitch < 0)
					client.back(-speed_pitch);
			}

			if(data.button == 'cstick_x'){
				speed_yaw = getStickSpeed(data.value);
				if(speed_yaw == 0)
					stopMovement();
				if(speed_yaw > 0)
					client.clockwise(speed_yaw);
				if(speed_yaw < 0)
					client.counterClockwise(-speed_yaw);
			}

			if(data.button == 'cstick_y'){
				speed_vert = getStickSpeed(data.value);
				if(speed_vert == 0)
					stopMovement();
				if(speed_vert < 0)
					client.up(-speed_vert);
				if(speed_vert > 0)
					client.down(speed_vert);
			}

			if(data.button == 'l' && data.value == 1){
				client.animate('flipLeft', 1000);
				console.log('Flipping left!');
			}
			if(data.button == 'r' && data.value == 1){
				client.animate('flipRight', 1000);
				console.log('Flipping right!');
			}
			if(data.button == 'z' && data.value == 1 && !in_air){
				client  = arDrone.createClient();
				console.log('Reconnecting to drone...');
			}
		}
	});
});
