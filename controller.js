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
  lastPng = pngBuffer;

  //Instead of fs.write, cv.readImage TODO
  fs.writeFile('./img/' + Date.now() + '.png', pngBuffer, function (err) {
    if (err) throw err;
    console.log('It\'s saved!');
  });
});