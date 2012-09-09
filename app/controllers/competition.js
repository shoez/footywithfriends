
var rest = require('restler'),
	http = require('http'),
    redis = require('redis-node'),
    redisClient = redis.createClient(),
	questions = require('../questions');


redisClient.set('quizid', 0);


module.exports = function (app, bayeux) {


    app.get('/competition/:id/event/game/start', function(req, res){
		res.json('OK');
		var id = req.params.id;
		bayeux.getClient().publish('/competition/' + id + '/events/game/start', { timestamp: new Date(), start: true });
    });

    app.get('/competition/:id/event/game/stop', function(req, res){
		res.json('OK');
		var id = req.params.id;
		bayeux.getClient().publish('/competition/' + id + '/events/game/stop', { timestamp: new Date(), stop: true });
        bayeux.getClient().publish('/competition/' + id + '/events/game/results', { 
                                                                                    timestamp: new Date(), 
                                                                                    score: {
                                                                                        manchestercity: 3,
                                                                                        southampton: 2
                                                                                    },
                                                                                    firstgoal: { team: 'manchestercity', by: 'Carlos Tevez', how: 'Right Peg', when: 'first half'},
                                                                                    fastest: { team: 'southampton', by: 'Steven Davis', how: '67mph', when: 'second half'},
                                                                                    bookings: { yellow: 4, red: 0 },
                                                                                    acceleration: { team: 'southampton', by: 'Jay Rodriguez', how: '13mph'}
        });
    });

    app.get('/competition/:id/event/halftime/start', function(req, res){
		res.end('OK');
		var id = req.params.id;
		bayeux.getClient().publish('/competition/' + id + '/events/halftime/start', { timestamp: new Date(), start: true });
    });


    app.get('/competition/:id/event/halftime/stop', function(req, res){
		res.end('OK');
		var id = req.params.id;
		bayeux.getClient().publish('/competition/' + id + '/events/halftime/stop', { timestamp: new Date(), stop: true });
    });


    app.get('/competition/:id/event/quiztime/stop', function(req, res){
		res.end('OK');
		bayeux.getClient().publish('/competition/' + id + '/events/quiztime', { stop: true });
    });

    app.get('/competition/:id/event/quiztime', function(req, res){
        res.end('OK');
        var id = req.params.id;
        redisClient.incr('quizid');
        redisClient.get('quizid', function(err, count) {
            console.log(count);
            var qu = questions[count];
            console.log(questions.total, qu);
            bayeux.getClient().publish('/competition/' + id + '/events/quiztime', { 
                                                                                timestamp: new Date(), 
                                                                                start: true, 
                                                                                quiz: qu    
            });

        });
    });


    /* when answering the quiz question */
    app.post('/competition/:id', function(req, res){
		
		// assume quizId is 1 for the hack
        var competitionId = req.params.id;
		var quizId = req.body.quizId;
    	var uid = req.body.uid;
        var timeTaken = req.body.timeTaken; //time taken to answer the question - should really be server generated.
    	/* 	check the user is registered
    		check the user hasn't already answered
    		check the quizId exists */
    	var timestamp = new Date();
    	/*
			quiz id: { users: {UUID: true}, answers: [{user: UUID, answer: X}]}
    	*/

        var question = questions[quizId];
        var secondsRemaining = 690 - timeTaken; // 1.30 free to answer - 10m in total.
        var potentialScore = Math.floor(question.scoring * Math.pow((Math.log(secondsRemaining) / Math.LN2), 2));

    	redisClient.get('competition.'+competitionId + '.quiz.'+quizId, function(err, data) {
    		if (!data.users[uid]) {
    			data.answers.push({user: uid, answer: req.body.answer, time: timestamp, potentialScore: potentialScore});
    			data.users[uid] = true;
    			redisClient.set('quiz.id.'+quizId, data);
    		}
    	});

        bayeux.getClient().publish('/competition/' + req.params.id + '/user/' + uid, {potentialScore: potentialScore});

		res.json('OK');
    });


    /* when answering the quiz question */
    app.get('/competition/:id/calculate', function(req, res){
		
		// assume quizId is 1 for the hack
		var quizId = req.body.quizId;
    	var uid = req.body.uid;
    	/* 	check the user is registered
    		check the user hasn't already answered
    		check the quizId exists */

    	/*
			quiz id: { users: {UUID: true}, answers: [{user: UUID, answer: X}]}
    	*/
    	redisClient.get("quiz.id."+quizId, function(data) {
    		if (!data.users[uid]) {
    			data.answers.push({user: uid, answer: req.body.answer});
    			data.users[uid] = true;
    			redisClient.set("quiz.id."+quizId, data);
    		}
    	});

		res.end('OK');
    });



};



