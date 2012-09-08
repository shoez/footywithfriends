
var rest = require('restler'),
	http = require('http');

module.exports = function (app, io) {


    app.get('/competition/:id/event/game/start', function(req, res){
		res.end('OK');
		var id = req.params.id;
		io.sockets.on('connection', function (socket) {
			socket.emit('competition.' + id + '.events.game.start', { timestamp: new Date(), start: true });
		});
    });

    app.get('/competition/:id/event/game/stop', function(req, res){
		res.end('OK');
		var id = req.params.id;
		io.sockets.on('connection', function (socket) {
			socket.emit('competition.' + id + '.events.game.stop', { timestamp: new Date(), stop: true });
		});
    });

    app.get('/competition/:id/event/halftime/start', function(req, res){
		res.end('OK');
		var id = req.params.id;
		io.sockets.on('connection', function (socket) {
			socket.emit('competition.' + id + '.events.halftime.start', { timestamp: new Date(), start: true });
		});
    });


    app.get('/competition/:id/event/halftime/stop', function(req, res){
		res.end('OK');
		var id = req.params.id;
		io.sockets.on('connection', function (socket) {
			socket.emit('competition.' + id + '.events.halftime.stop', { timestamp: new Date(), stop: true });
		});
    });


    app.get('/competition/:id/event/quiztime', function(req, res){
		res.end('OK');
		var id = req.params.id;
		io.sockets.on('connection', function (socket) {
			socket.emit('competition.' + id + '.events.quiztime', { timestamp: new Date(), 
																start: true, 
																quiz: {
																	question: 'Number of tackles in next period?',
																	id: 1,
																	type: "multiple", // or 'binary'
																	options: ['0-4', '5-8', '9-12', 'More!']
																}
			});
		});
    });


    /* when answering the quiz question */
    app.post('/competition/:id/quiz', function(req, res){
		
    });



};




