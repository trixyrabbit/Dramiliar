var gc = require('./gamecube_device.js');
var arDrone = require('ar-drone');
var fs = require('fs');
var PaVEParser = require('ar-drone/lib/video/PaVEParser'); 
var cv = require('opencv');

var client  = arDrone.createClient();

var twitter = require('twitter');
var twitterClient = new twitter({
	consumer_key: 'SweQ8xRKo5d2DPcMoQ9Dwve3Q',
	consumer_secret: 'OqOJLro04uAfB39xWStjbwX5E2a6AFPEZFKnBZyZQUNHxADrdD',
	access_token_key: '3157351209-0MHzCdahaX7MmLeliimRDGX3QNHlpFIOUsncBOS',
	access_token_secret: '3MpJAlTVTqw9g5jwqajMbc1g5aibuOnAwauhU7rvEHoI8'
});
var lastPng;
var pngStream = client.getPngStream();


var tweetToggle = false;
var in_air = false;	
var emergency = false;
var camera_attached = false;
var speed_yaw = 0;
var speed_pitch = 0;
var speed_roll = 0;
var speed_vert = 0;

var dance_i = 0;

//head camera
client.config('video:video_channel', 0);

setTimeout(attachCamera, 5000);


/* * * * * * * * * * * * * 
 *   BEGIN TWITTER STUFF
 * * * * * * * * * * * * */

// This allows us to track mentions of bitdrone.  This grabs everything, not just
// TODO: Have a button activate/deactivate this functionality

twitterClient.stream('statuses/filter', {track: 'bitdrone'}, function(stream){
	stream.on('data', function(tweet) {
		console.log(tweet.text);
		var tcom = tweetTokens[1].toLowerCase();
		if(tweetToggle) {
			tweetTokens = tweet.text.split(" ");
			if(tweetTokens[0] == '@bitdrone'){
				if(tcom == '#flipit'
				|| tcom == '#flipit!'){
					client.animate('flipRight',1000);
				}
				if(tcom == '#spin'
				|| tcom == '#spinRight')
					client.clockwise(1);
				}
				if(tcom == '#spinLeft')
					client.counterClockwise(1);
				}
				if(tcom == '#forward'
				|| tcom == '#go')
					client.front(1);
				}
				if(tcom == '#start'
				|| tcom == '#takeoff'
				|| tcom == '#liftoff')
					client.takeoff();
				}
			}

		}
	});

	stream.on('error', function(error) {
		console.log(error);
	});
});

function tweet(content) {
	console.log('trying to tweet');
		twitterClient.post('statuses/update', { status: content }, function(error, tweet, response) {
			if(error) return;
			console.log(tweet);
			console.log(response);
		});
}
//TODO catch no internet connection errr so we dont drop connection
// Data should be var data = require('fs').readFileSync('LOCATION_OF_PHOTO');
function tweetPic(content, data) {
	twitterClient.post('media/upload', { media: data }, function(error, media, response) {
		console.log('posting a pic');
		if(error) return;
		var status = {
			status: content,
			media_ids: media.media_id_string
		}

		twitterClient.post('statuses/update', status, function(error, tweet, response) {
			if(!error){
				console.log('tweeting a dank photo!');
			}
		});
	});
}

/* * * * * * * * * * *
 *     END TWITTER
 * * * * * * * * * * */

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
	console.log('Connecting png stream ...');
	//save img streams from camera
	pngStream
		.on('error', console.log)
		.on('data', function(pngBuffer) {
		lastPng = pngBuffer;
		cv.readImage(pngBuffer, function(err, im){
			im.detectObject(cv.FACE_CASCADE, {}, function(err, faces){
				if(faces && faces.length > 0){
					for (var i=0;i<faces.length; i++){
						var x = faces[i]
						im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
						var imagename = './img/face'+Date.now()+'.png';
						im.crop(x.x, x.y, x.width, x.height).save(imagename);
					}
					//im.save(imagename);
					console.log('Saved face image ' + imagename);
				}else{
					console.log('No faces!');
				}
			});
		});	
	});
}


gc(function(controller){
	controller.on('buttonChange', function(data){

		if(data.button == 'a' && data.value == 1){
			client.stop();
			client.land();
			emergency = true;
			console.log('EMERGENCY LANDING');
			setTimeout(function(){
				client.stop();
				client.land();
				setTimeout(function(){
					client = arDrone.createClient();
					client.stop();
					client.land();
				},1000)
			},1000);
			//detatchCamera();
		}
		if(!emergency){
			if(data.button == 'start' && data.value == 1){
				if(in_air){
					client.land();
					console.log('Landing');
					in_animation = false;
					//detatchCamera();
					in_air = false;
				}else{
					client.takeoff();
					console.log('Taking off!');
					in_animation = false;
					in_air = true;
					//setTimeout(attachCamera, 2000);
				}
			}

			if(data.button == 'stick_x'){
				speed_roll = getStickSpeed(data.value);
				if(speed_roll == 0)
					stopMovement();
				if(speed_roll > 0){
					client.right(speed_roll);
					in_animation = false;
				}
				if(speed_roll < 0){
					client.left(-speed_roll);
					in_animation = false;
				}
			}

			if(data.button == 'stick_y'){
				speed_pitch = getStickSpeed(data.value);
				if(speed_pitch == 0)
					stopMovement();
				if(speed_pitch < 0){
					client.front(-speed_pitch);
					in_animation = false;
				}
				if(speed_pitch > 0){
					client.back(speed_pitch);
					in_animation = false;
				}
			}

			if(data.button == 'cstick_x'){
				speed_yaw = getStickSpeed(data.value);
				if(speed_yaw == 0)
					stopMovement();
				if(speed_yaw > 0){
					client.clockwise(speed_yaw);
					in_animation = false;
				}
				if(speed_yaw < 0){
					client.counterClockwise(-speed_yaw);
					in_animation = false;
				}
			}

			if(data.button == 'cstick_y'){
				speed_vert = getStickSpeed(data.value);
				if(speed_vert == 0)
					stopMovement();
				if(speed_vert < 0){
					client.up(-speed_vert);
					in_animation = false;
				}
				if(speed_vert > 0){
					client.down(speed_vert);
					in_animation = false;
				}
			}

			if(data.button == 'l' && data.value == 1){
				in_animation = false;
				client.stop();
				client.animate('flipLeft', 1000);
				console.log('Flipping left!');
				tweet('Doing a barrel roll!' + Date.now());
			}
			if(data.button == 'r' && data.value == 1){
				in_animation = false;
				client.stop();
				client.animate('flipRight', 1000);
				console.log('Flipping right!');
				tweet('Doing a barrel roll!' + Date.now());
			}
			if(data.button == 'b' && data.value == 1){
				console.log(' tweet tweet x ' + Date.now() + '!' );
				tweet(' tweet tweet x ' + Date.now() + '!');
			}
			if(data.button == 'x' && data.value == 1){
				console.log(' tweeting a pic');
				tweetPic(' tweet tweet here is a face! ' + Date.now() + '!', lastPng);
			}
			if(data.button == 'y' && data.value == 1){
				tweetToggle = !tweetToggle;
				console.log('Tweet toggle set to ' + tweetToggle);
			}
			if(data.button == 'dpad_down' && data.value == 1){
				in_animation = false;
				client.animate('turnaround', 1000);
				console.log('Turning around');
			}
			if(data.button == 'dpad_left' && data.value == 1){
				//do a spin
				console.log('Starting big spin');
				in_animation = true;
				client.clockwise(1);
				client.front(0.5);
				setTimeout(function(){
					if(in_animation){
						client.stop();
						console.log('Stopping spin');
					}
				},5000);
			}
			if(data.button == 'dpad_up' && data.value == 1){
				var dances = ['phiM30Deg', 'phi30Deg', 'thetaM30Deg', 'theta30Deg', 'theta20degYaw200deg',
'theta20degYawM200deg', 'turnaround', 'turnaroundGodown', 'yawShake',
'yawDance', 'phiDance', 'thetaDance', 'vzDance', 'wave', 'phiThetaMixed',
'doublePhiThetaMixed', 'flipAhead', 'flipBehind', 'flipLeft', 'flipRight'];

				if(dance_i >= dances.length){
					dance_i = 0;
				}

				console.log('Animation test: ' + dances[dance_i]);

				client.animate(dances[dance_i++], 5000);
			}
		}
	});
});

/*
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

	video.pipe(parser); */ /*
	//save pngs and detect faces...
	console.log('Connecting png stream ...');
	var lastPng;
	var pngStream = client.getPngStream();
	//save img streams from camera
	pngStream
	.on('error', console.log)
	.on('data', function(pngBuffer) {
	  lastPng = pngBuffer;
*/
	  /*Instead of fs.write, cv.readImage TODO
	  fs.writeFile('./img/' + Date.now() + '.png', pngBuffer, function (err) {
	    if (err) throw err;
	    console.log('It\'s saved!');
	  }); */
	//see check the image for faces, save it

/*
			var s = new cv.ImageStream()
		 
			s.on('data', function(matrix){
			cv.readImage(pngBuffer, function(err, im){
				im.detectObject(cv.FACE_CASCADE, {}, function(err, faces){
					if(faces && faces.length > 0){
						for (var i=0;i<faces.length; i++){
							var x = faces[i]
								im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
							}	var imagename = './img/face'+Date.now()+'.png';
							im.save(imagename);
							console.log('Saved face image ' + imagename);
						}
					console.log('No faces!');
					});
				});
			});
			 
			client.getPngStream().pipe(s);
*/
