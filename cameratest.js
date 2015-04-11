var arDrone = require('ar-drone');

var options = {
	frameRate: 60,
	imageSize: '1280x720'
};

var client  = arDrone.createClient(options);

var fs = require('fs');
var cv = require('opencv');
var pngStream;

function attachCamera(){

	console.log('Connecting png stream ...');
	pngStream = client.getPngStream();
	var lastPng;
	//save img streams from camera
	pngStream.on('error', console.log)
	.on('data', function(pngBuffer) {
		console.log('Got image!');

		cv.readImage(pngBuffer, function(err, im){
			im.detectObject(cv.FACE_CASCADE, {}, function(err, faces){
				if(faces && faces.length > 0){
					for (var i=0;i<faces.length; i++){
						var x = faces[i]
						//im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
						var imagename = './img/face'+Date.now()+'.png';
						im.crop(x.x - x.width, x.y - x.height, x.width*2, x.height*2).save(imagename);
						console.log('Saved face image ' + imagename);
					}
				}else{
					console.log('No faces!');
				}
				var imagename = './img/raw'+Date.now()+'.png';
				im.save(imagename);
			});
		});
	});
}

console.log('Battery: ' + client.battery());

setTimeout(function(){
	client.takeoff();
	console.log('Taking off');
	setTimeout(function(){
		console.log('Attaching camera');
		attachCamera();
		setTimeout(function(){
			console.log('Landing');
			client.land();
		},15000);
	},5000);
},5000);