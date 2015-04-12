var cv = require('opencv');

cv.readImage("./allen_example.jpg", function(err, im){
	  im.detectObject(cv.FACE_CASCADE, {}, function(err, faces){
		      for (var i=0;i<faces.length; i++){
					      var x = faces[i]
				im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
				im.crop( x.x , x.y , x.width , x.height);
							    }
				    im.save('./out.jpg');
					   });
})
