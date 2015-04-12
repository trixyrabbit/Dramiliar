var sys = require('sys');
var exec = require('child_process').exec;

function queeryMM(content, cb) {
		var child = exec('curl -H "Authorization: Basic ou0TZLDnWg1eCrmwSGshJzCbQPBnF7n3lGrpwqROj9PkKFEmoC" -d \'{"classifier_id":155,"value":' + content + '}\' "https://www.metamind.io/language/classify" ', function (error, stdout, stderr) {
			var classes = JSON.parse(stdout);
			if (error !== null) {
				//
				console.log('exec error: ' + error);

			}
			if(classes.predictions[0].class_id == 2) {
				client.stop();
				console.log('seems you are a nice person');
				cb(true);
			}
			else cb(false)
		});
}