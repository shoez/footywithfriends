
var rest = require('restler'),
	http = require('http'),
	redis = require('redis-node'),
    redisClient = redis.createClient(),
    uuid = require('node-uuid');


module.exports = function (app, bayeux) {


    app.get('/user', function(req, res){
		//bayeux.getClient().publish('/competition/' + id + '/events/game/start', { timestamp: new Date(), start: true });
    });

    app.get('/user/register', function(req, res){
		
		var uid = uuid.v4();
		res.json(JSON.stringify({'uuid': uid}));

		redisClient.set("user.uuid."+uid, uid);

    });





};




