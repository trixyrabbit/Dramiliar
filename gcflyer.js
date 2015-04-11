var gc = require('./gamecube_device.js');
var arDrone = require('ar-drone');
var client  = arDrone.createClient();
var fs = require('fs');
var PaVEParser = require('ar-drone/lib/video/PaVEParser'); 
var cv = require('opencv');

var twitter = require('twitter');
var twitterClient = new twitter({
	consumer_key: 'SweQ8xRKo5d2DPcMoQ9Dwve3Q',
	consumer_secret: 'OqOJLro04uAfB39xWStjbwX5E2a6AFPEZFKnBZyZQUNHxADrdD',
	access_token_key: '3157351209-0MHzCdahaX7MmLeliimRDGX3QNHlpFIOUsncBOS',
	access_token_secret: '3MpJAlTVTqw9g5jwqajMbc1g5aibuOnAwauhU7rvEHoI8'
});

var twitterParams = {screen_name: 'bitdrone'};

var in_air = false;
var emergency = false;
var camera_attached = false;
var speed_yaw = 0;
var speed_pitch = 0;
var speed_roll = 0;
var speed_vert = 0;

//head camera
//client.config('video:video_channel', 0);

setTimeout(attachCamera, 100);

function getStickSpeed(value){
	var speed = 0;
	if(value < 100)
		speed = -((100-value)/100);
	if(value > 148)
		speed = (value-148)/100;

	return speed;
}

function stopMovement(){
	if(speed_vert == 0 && speed_pitch == 0 && speed_yaw == 0 && speed_roll == 0){
		client.stop();
	}
}

function attachCamera(){
	if(camera_attached)return;
	camera_attached = true;
	var output = fs.createWriteStream('./vid.h264');
	console.log('Connecting video stream ...');
	video = client.getVideoStream();
	var parser = new PaVEParser();
	parser
  		.on('data', function(data) {
    	output.write(data.payload);
  	})
  		.on('end', function() {
    	output.end();
  	});

	video.pipe(parser);
	/*video.on('error', console.log)
	.on('data', function(pngBuffer) {
		console.log('Got image!');
		  //Just save file to 
		  fs.writeFile('./img/' + Date.now() + '.png', pngBuffer, function (err) {
		  		if (err) throw err;
		    	console.log('It\'s saved!');
		  });
	*/
		/*
		cv.readImage(pngBuffer, function(err, im){
			im.detectObject(cv.FACE_CASCADE, {}, function(err, faces){
				if(faces && faces.length > 0){
					for (var i=0;i<faces.length; i++){
						var x = faces[i]
						im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
					}	var imagename = './img/'+Date.now()+'.png';
					im.save(imagename);
					console.log('Saved face image ' + imagename);
				}
				console.log('No faces!');
			});
		})
		*/
	//});
}

function detatchCamera(){
	if(video && video.close){
		video.close();
		camera_attached = false;
	}
}

function tweet(content) {
	if( typeof content == String ) {
		if(content.length <= 140) {
			twitterClient.post('statuses/update', { status: content }, function(error, tweet, response) {
				if(error) throw error;
				console.log(tweet);
				console.log(response);
			});

			tweetDelta = 0;
		}
	}
}

gc(function(controller){
	controller.on('buttonChange', function(data){


		if(data.button == 'a' && data.value == 1){

			client.land();
			emergency = true;
			console.log('EMERGENCY LANDING');
			detatchCamera();
		}
		if(!emergency){
			if(data.button == 'start' && data.value == 1){
				if(in_air){
					client.land();
					console.log('Landing');
					detatchCamera();
					in_air = false;
				}else{
					client.takeoff();
					console.log('Taking off!');
					in_air = true;
					//setTimeout(attachCamera, 100);
				}
			}

			if(data.button == 'stick_x'){
				speed_roll = getStickSpeed(data.value);
				if(speed_roll == 0)
					stopMovement();
				if(speed_roll > 0)
					client.right(speed_roll);
				if(speed_roll < 0)
					client.left(-speed_roll);
			}

			if(data.button == 'stick_y'){
				speed_pitch = getStickSpeed(data.value);
				if(speed_pitch == 0)
					stopMovement();
				if(speed_pitch < 0)
					client.front(-speed_pitch);
				if(speed_pitch > 0)
					client.back(speed_pitch);
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
				tweet('Doing a barrel roll!');
			}
			if(data.button == 'r' && data.value == 1){
				client.animate('flipRight', 1000);
				console.log('Flipping right!');
				tweet('Doing a barrel roll!');
			}
			if(data.button == 'z' && data.value == 1 && !in_air){
				client  = arDrone.createClient();
				console.log('Reconnecting to drone...');
			}
			if(data.button == 'b' && data.value == 1 && !in_air){
				tweet('test tweet!');
			}
		}
	});
});


console.log('Connecting png stream ...');
var pngStream = arDrone.createClient().getPngStream();
var lastPng;
//save img streams from camera
pngStream
.on('error', console.log)
.on('data', function(pngBuffer) {
  //lastPng = pngBuffer;

  //Instead of fs.write, cv.readImage TODO
  //fs.writeFile('./img/' + Date.now() + '.png', pngBuffer, function (err) {
    //if (err) throw err;
    //console.log('It\'s saved!');
  //});

  cv.readImage("./pngBuffer", function(err, im){
		im.detectObject(cv.FACE_CASCADE, {}, function(err, faces){
			for (var i=0;i<faces.length; i++){
				var x = faces[i]
				//im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
				im.crop(x.x , x.x + x.width, x.y , x.y +x.height);
			}
			var imagename = './img/out'+Date.now()+'.png';
			im.save(imagename);
			console.log('Saved ' + imagename)
		});
  })
});
