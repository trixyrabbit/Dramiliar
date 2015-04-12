var twitter = require('twitter');

var twitterClient = new twitter({
	consumer_key: 'SweQ8xRKo5d2DPcMoQ9Dwve3Q',
	consumer_secret: 'OqOJLro04uAfB39xWStjbwX5E2a6AFPEZFKnBZyZQUNHxADrdD',
	access_token_key: '3157351209-0MHzCdahaX7MmLeliimRDGX3QNHlpFIOUsncBOS',
	access_token_secret: '3MpJAlTVTqw9g5jwqajMbc1g5aibuOnAwauhU7rvEHoI8'
});

var twitterParams = {screen_name: 'bitdrone'};

twitterClient.stream('statuses/filter', {track: 'bitdrone'}, function(stream){
	stream.on('data', function(tweet) {
			console.log(tweet.text);
			});

	stream.on('error', function(error) {
		console.log(error);
	});
});
