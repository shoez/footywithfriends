footy = {
	init: function() {
		// Get user

		// Init listeners
		this.setupListeners();
	}
};

footy.setupListeners = function() {
	var id = 100;
    var client = new Faye.Client('http://localhost:8000/faye');

    var Logger = {
      incoming: function(message, callback) {
        console.log('incoming', message);
        callback(message);
      },
      outgoing: function(message, callback) {
        console.log('outgoing', message);
        callback(message);
      }
    };

    //client.addExtension(Logger);

    client.subscribe('/competition/' + id + '/events/quiztime', function (data) {
      console.log('Now show the quiz', data);
    });

    console.log('subscribe to game start');
    var start = client.subscribe('/competition/' + id + '/events/game/start', function (data) {
      console.log(data);
    });
    start.callback(function() {
      console.log('Subscription is now active!');
    });

    client.subscribe('/competition/' + id + '/events/game/stop', function (data) {
      console.log(data);
    });
    client.subscribe('/competition/' + id + '/events/halftime/stop', function (data) {
      console.log(data);
    });
    client.subscribe('/competition/' + id + '/events/halftime/start', function (data) {
      console.log(data);
    });
};
