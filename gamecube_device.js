var fs = require('fs');
var events = require('events');
var next_device_attempt = 0;
var device_found = false;

var emitter = new events.EventEmitter();

var last_stick_x = 0;
var last_stick_y = 0;
var last_cstick_x = 0;
var last_cstick_y = 0;
var last_l_pressure = 0;
var last_r_pressure = 0;
var last_x = 0;
var last_a = 0;
var last_b = 0;
var last_y = 0;
var last_l = 0;
var last_r = 0;
var last_z = 0;
var last_start = 0;
var last_dpad_down = 0;
var last_dpad_left = 0;
var last_dpad_up = 0;
var last_dpad_right = 0;

function connectToFile(filename, callback){
	console.log('GC: checking ' + filename);
	var readStream = fs.createReadStream(filename);
	// This will wait until we know the readable stream is actually valid before piping
	var thisDeviceID = next_device_attempt-1;
	setTimeout(function(){
		if(!device_found && thisDeviceID != next_device_attempt-1){
			//if this isn't the correct device AND we have already started checking the next device
			readStream.close();
			console.log('Timeout');
		}else if(!device_found){
			//if this isn't the correct device ANd we havn't started checking the next device
			filename = '/dev/hidraw' + next_device_attempt++;
			connectToFile(filename, callback);
			readStream.close();
			console.log('Timeout, restart');
		}

	},1000);
	readStream.on('data', function (chunk) {
		if(!device_found && chunk.length == 8){
			device_found = true;
			console.log('GC:Device found!');
			callback(emitter);
		}else if(!device_found && filename == '/dev/hidraw' + (next_device_attempt-1)){
			filename = '/dev/hidraw' + next_device_attempt++;
			connectToFile(filename, callback);
			readStream.close();
			console.log('Fail, restart' + chunk.length);
		}else if(!device_found){
			readStream.close();
			console.log('Fail');
		}else if(device_found){
			// This just pipes the read stream to the response object (which goes to the client)
			var logstr = '';
			var bits = [];
			var temp = chunk[6]<<8 + chunk[7];

			for(var i = 0; i < chunk.length; i++){

				if( i == 2 )
					stick_x = chunk[i];
				if( i == 3 )
					stick_y = chunk[i];
				if( i == 4 )
					cstick_y = chunk[i];
				if( i == 5 )
					cstick_x = chunk[i];

				for(var j = 0; j < 8; j++){
					bits.push((chunk[i]&(1<<j))>>j);
					if(i == 7)logstr += (chunk[i]&(1<<j))>>j;
					//chunk[i]>>=1;
				}
			}

			var stick_x = chunk[2];
			var stick_y = chunk[3];
			var cstick_x = chunk[5];
			var cstick_y = chunk[4];
			var l_pressure = (chunk[6] & 0x3c)>>2;
			var r_pressure = (chunk[7] & 0x0f);
			var x = bits[0];
			var a = bits[1];
			var b = bits[2];
			var y = bits[3];
			var l = bits[4];
			var r = bits[5];
			var z = bits[7];
			var start = bits[9];
			var dpad_down = 0;
			var dpad_left = 0;
			var dpad_up = 0;
			var dpad_right = 0;

			var d = [(chunk[7]&(0x1<<4))>>4, (chunk[7]&(0x1<<5))>>5, (chunk[7]&(0x1<<6))>>6, (chunk[7]&(0x1<<7))>>7];
			if(!d[0]&&!d[1]&& d[2]&&!d[3] || d[0]&&!d[1]&& d[2]&&!d[3] || d[0]&& d[1]&&!d[2]&&!d[3] )
				dpad_down = 1;
			if( d[0]&&!d[1]&& d[2]&&!d[3] ||!d[0]&& d[1]&& d[2]&&!d[3] || d[0]&& d[1]&& d[2]&&!d[3] )
				dpad_left = 1;
			if( d[0]&& d[1]&& d[2]&&!d[3] ||!d[0]&&!d[1]&&!d[2]&&!d[3] || d[0]&&!d[1]&&!d[2]&&!d[3] )
				dpad_up = 1;
			if( d[0]&&!d[1]&&!d[2]&&!d[3] ||!d[0]&& d[1]&&!d[2]&&!d[3] || d[0]&& d[1]&&!d[2]&&!d[3] )
				dpad_right = 1;

			if(stick_x != last_stick_x)emitter.emit('buttonChange', {button:'stick_x', value: stick_x});
			if(stick_y != last_stick_y)emitter.emit('buttonChange', {button:'stick_y', value: stick_y});
			if(cstick_x != last_cstick_x)emitter.emit('buttonChange', {button:'cstick_x', value: cstick_x});
			if(cstick_y != last_cstick_y)emitter.emit('buttonChange', {button:'cstick_y', value: cstick_y});
			if(l_pressure != last_l_pressure)emitter.emit('buttonChange', {button:'l_pressure', value: l_pressure});
			if(r_pressure != last_r_pressure)emitter.emit('buttonChange', {button:'r_pressure', value: r_pressure});
			if(x != last_x)emitter.emit('buttonChange', {button:'x', value: x});
			if(a != last_a)emitter.emit('buttonChange', {button:'a', value: a});
			if(b != last_b)emitter.emit('buttonChange', {button:'b', value: b});
			if(y != last_y)emitter.emit('buttonChange', {button:'y', value: y});
			if(l != last_l)emitter.emit('buttonChange', {button:'l', value: l});
			if(r != last_r)emitter.emit('buttonChange', {button:'r', value: r});
			if(z != last_z)emitter.emit('buttonChange', {button:'z', value: z});
			if(start != last_start)emitter.emit('buttonChange', {button:'start', value: start});
			if(dpad_down != last_dpad_down)emitter.emit('buttonChange', {button:'dpad_down', value: dpad_down});
			if(dpad_left != last_dpad_left)emitter.emit('buttonChange', {button:'dpad_left', value: dpad_left});
			if(dpad_up != last_dpad_up)emitter.emit('buttonChange', {button:'dpad_up', value: dpad_up});
			if(dpad_right != last_dpad_right)emitter.emit('buttonChange', {button:'dpad_right', value: dpad_right});

			last_stick_x = stick_x;
			last_stick_y = stick_y;
			last_cstick_x = cstick_x;
			last_cstick_y = cstick_y;
			last_l_pressure = l_pressure;
			last_r_pressure = r_pressure;
			last_x = x;
			last_a = a;
			last_b = b;
			last_y = y;
			last_l = l;
			last_r = r;
			last_z = z;
			last_start = start;
			last_dpad_down = dpad_down;	
			last_dpad_left = dpad_left;
			last_dpad_up = dpad_up;
			last_dpad_right = dpad_right;
		}
	});
}

module.exports = function(callback){
	filename = '/dev/hidraw' + next_device_attempt++;
	connectToFile(filename, callback);
}