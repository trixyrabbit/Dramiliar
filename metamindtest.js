var sys = require('sys');
var exec = require('child_process').exec;
var curlreq = 'curl -H "Authorization: Basic ou0TZLDnWg1eCrmwSGshJzCbQPBnF7n3lGrpwqROj9PkKFEmoC" -d \'{"classifier_id":155,"value":  "fuck you bastards git"  }\' "https://www.metamind.io/language/classify" '
console.log(curlreq);
var child = exec(curlreq, function (error, stdout, stderr) {
						
						sys.print('stdout: ' + stdout);
						var classes = JSON.parse(stdout);
						for(var i = 0; i<classes.predictions.length; i++) {
							classes.predictions[i]
						}
						sys.print('stderr: ' + stderr);
						if (error !== null) {

							console.log('exec error: ' + error);

						}
					});