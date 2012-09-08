var express = require('express'),
    util = require('util'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    io = require('socket.io').listen(server),
    connect = require('express/node_modules/connect'),
    parseCookie = connect.utils.parseCookie,
    MemoryStore = connect.middleware.session.MemoryStore,
    store;


io.set('authorization', function (data, accept) {
  if (!data.headers.cookie) 
    return accept('No cookie transmitted.', false);

  data.cookie = parseCookie(data.headers.cookie);
  data.sessionID = data.cookie['express.sid'];

  store.load(data.sessionID, function (err, session) {
    if (err || !session) return accept('Error', false);

    data.session = session;
    return accept(null, true);
  });
}).sockets.on('connection', function (socket) {
  var sess = socket.handshake.session;
  socket.log.info(
      'a socket with sessionID'
    , socket.handshake.sessionID
    , 'connected'
  );
  socket.on('set value', function (val) {
    sess.reload(function () {
      sess.value = val;
      sess.touch().save();
    });
  });


  socket.emit('news', { hello: 'world' });

});



require('./controllers/competition')(app, io);
//require('./controllers')(app, io);
//require('./controllers')(app, io);




app.configure(function () {
  app.set('view engine', 'jinjs');
  app.set('view options', {layout: false});
  app.use(express.cookieParser());
  app.use(express.session({
      secret: 'secret'
    , key: 'express.sid'
    , store: store = new MemoryStore()
  }));
});




app.listen(8080);





