
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


    /* mnotify the client of a goal */
    app.get('/competition/:id/event/goal', function(req, res){
        res.json('OK');
        bayeux.getClient().publish('/competition/' + id + '/events/goal', { team: res.param.team  });
    });



    /* result calculated */
    app.post('/competition/:id/event/result', function(req, res){
        var competitionId = req.params.id;
        //quizid0=1&answer0=1&quizid1=2&answer1=2&quizid2=3&answer2=0
        var answers = [{id:req.body.quizid0, a:req.body.answer0},{id:req.body.quizid1, a:req.body.answer1},{id:req.body.quizid2, a:req.body.answer2} ];

        for (var i = 0; i < answers.length; i++) {
            redisClient.get('competition.'+competitionId + '.quiz.'+answers[i].id, function(err, data) {
                for (var i = 0; i < data.answers.length; i++) {
                    // if the actual result from answers (http input) matches the users answer,
                    // give them some score
                    if (answers[i].a == data.answers[i].answer) {
                        redisClient.get('user.uuid.'+data.answers[i].user, function(err, userData) {
                            var score = userData.score;
                            if (!score) {
                                score = 0;
                            }
                            score += data.answers[i].potentialScore;
                            redisClient.set('user.uuid.'+data.answers[i].user, {score: score});
                            bayeux.getClient().publish('/competition/' + competitionId + '/user/' + data.answers[i].user, {
                                                                                                                            win: true,
                                                                                                                            earnedScore: data.answers[i].potentialScore,
                                                                                                                            score: score,
                                                                                                                            quiz: questions[answers[i].id],
                                                                                                                            answer: data.answers[i].answer

                            });

                        });

                    } else {
                        bayeux.getClient().publish('/competition/' + competitionId + '/user/' + data.answers[i].user, {
                                                                                                                        win: false,
                                                                                                                        lostScore: data.answers[i].potentialScore,
                                                                                                                        quiz: questions[answers[i].id],
                                                                                                                        answer: data.answers[i].answer

                        });
                    }
                }
            });
        }

        res.end('OK');
        //bayeux.getClient().publish('/competition/' + id + '/events/goal', { team:  });
    });



    app.options('/competition/:id', function(req, res){
        res.header("Access-Control-Allow-Origin", "*");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, Content-Type, X-Requested-With');
        res.end('OK');
    })

    /* when answering the quiz question */
    app.post('/competition/:id', function(req, res){
        res.header("Access-Control-Allow-Origin", "*");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, Content-Type, X-Requested-With');
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



