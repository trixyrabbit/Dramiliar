// Run this to receive a png image stream from your drone.
var arDrone = require('ar-drone');
var fs = require('fs');
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
				im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
			}
			
			im.save('./out.png');
		});
  })
});
