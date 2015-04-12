var twitter = require('twitter');
var twitterClient = new twitter({
	consumer_key: 'SweQ8xRKo5d2DPcMoQ9Dwve3Q',
	consumer_secret: 'OqOJLro04uAfB39xWStjbwX5E2a6AFPEZFKnBZyZQUNHxADrdD',
	access_token_key: '3157351209-0MHzCdahaX7MmLeliimRDGX3QNHlpFIOUsncBOS',
	access_token_secret: '3MpJAlTVTqw9g5jwqajMbc1g5aibuOnAwauhU7rvEHoI8'
});

var twitterParams = {screen_name: 'bitdrone'};

var tweetDelta = 0; // Keep track of when our last post was.
var minTweetDelta = 60000; // Only one post per minute

var data = require('fs').readFileSync('./allen_example.jpg');

twitterClient.post('media/upload', { media: data }, function(error, media, response) {
				console.log(media);

	var status = {
		status: 'Womp womp',
		media_ids: media.media_id_string
	}

	twitterClient.post('statuses/update', status, function(error, tweet, response) {
		if(!error) {	
			console.log(tweet);
		}
	});
});
