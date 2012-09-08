var express = require('express'),
    util = require('util'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    faye = require('faye'),
    connect = require('express/node_modules/connect'),
    parseCookie = connect.utils.parseCookie,
    MemoryStore = connect.middleware.session.MemoryStore,
    store;


var bayeux = new faye.NodeAdapter({mount: '/faye', timeout: 45});
bayeux.listen(8000);


require('./controllers/competition')(app, bayeux);
require('./controllers/users')(app, bayeux);
//require('./controllers')(app, io);




app.configure(function () {
  app.set('view engine', 'jinjs');
  app.set('views', __dirname + '/views');
  app.set('view options', {layout: false});
  app.use(express.static(__dirname + '/public', { maxAge: 3600 }));
  app.use(express.cookieParser());
  app.enable('jsonp callback');
  app.use(express.session({
      secret: 'secret'
    , key: 'express.sid'
    , store: store = new MemoryStore()
  }));
});


bayeux.attach(server);
app.listen(8080);

