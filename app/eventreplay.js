
var http = require('http'),
	querystring = require('querystring');

var events = [
	{name: 'start', time: 20, 'url': '/competition/1/event/game/start'},
	{name: 'comp', time: 30, 'url': '/competition/1/event/quiztime'},
	{name: 'comp', time: 45, 'url': '/competition/1/event/quiztime/stop'},
	{name: 'comp', time: 48, 'url': '/competition/1/event/result', payload: [{quizid: 1, answer: 1}, {quizid: 2, answer: 2}, {quizid: 3, answer: 0}]},
	{name: 'game', time: 55, 'url': '/competition/1/event/goal', payload: [{team: 'southampton'}]},
	{name: 'game', time: 55, 'url': '/competition/1/event/goal', payload: [{team: 'manchestercity'}]},
	{name: 'comp', time: 65, 'url': '/competition/1/event/quiztime'},
	{name: 'comp', time: 85, 'url': '/competition/1/event/quiztime/stop'},
	{name: 'comp', time: 87, 'url': '/competition/1/event/result', payload: [{quizid: 4, answer: 1}, {quizid: 5, answer: 3}, {quizid: 6, answer: 0}]},
	{name: 'comp', time: 105, 'url': '/competition/1/event/quiztime'},
	{name: 'comp', time: 125, 'url': '/competition/1/event/quiztime/stop'},
	{name: 'comp', time: 127, 'url': '/competition/1/event/result', payload: [{quizid: 7, answer: 3}, {quizid: 8, answer: 0}, {quizid: 9, answer: 3}]},
	{name: 'comp', time: 140, 'url': '/competition/1/event/halftime/start'},
];


for (var i = 0; i < events.length; i++) {
	setTimeout(function() { 
		console.log(this);
		var e = this;
		var data = '';
		if (e.payload) {
			data = querystring.stringify({answers:e.payload});
		}

		var options = {
		  host: 'localhost',
		  path: e.url,
		  //since we are listening on a custom port, we need to specify it by hand
		  port: '8080',
		  //This is what changes the request to a POST request
		  method: 'POST'
		};

		var callback = function(response) {
		  var str = ''
		  response.on('data', function (chunk) {
		    str += chunk;
		  });

		  response.on('end', function () {
		    console.log(str);
		  });
		}

		var req = http.request(options, callback);
		req.write(data);
		req.end();

	}.bind(events[i]), events[i].time*100);
}



