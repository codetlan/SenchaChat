var express = require('express'),
	app =  express(),
	http = require('http'),
	server = http.createServer(app),
	io = require('socket.io').listen(server),
	fs = require('fs'),
	connect = require('connect'),
	port = process.env.PORT || 8080;

//the app configuration
app.configure(function() {
    app.use(connect.static('./public'));
	app.set('appIndex', './public/index.html');
	app.use(connect.bodyParser());
	app.use(express.logger());
	app.use(express.errorHandler({ dumpExceptions: true }));
});
//we start teh server
server.listen(port, function() {
    console.log("Listening on " + port);
});

//set the routes
app.get('/', function(req, res) {
	res.sendfile(app.set('appIndex'));
});
app.get('/index.html', function(req, res) {
	res.sendfile(app.set('appIndex'))	
});
app.get('*', function(req, res) {
    res.send('not found', 404);
});

// usernames which are currently connected to the chat
var usernames = {};

io.sockets.on('connection', function(socket) {

	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function(data) {
		// we tell the client to execute 'updatechat' with 2 parameters
		io.sockets.emit('updatechat', socket.username, data);
	});

	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', function(username) {
		// we store the username in the socket session for this client
		socket.username = username;
		// add the client's username to the global list
		usernames[username] = username;
		// echo to client they've connected
		socket.emit('updatechat', 'SERVER', 'Hi '+ username +' !');
		// echo globally (all clients) that a person has connected
		socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');
		// update the list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
	});

	// when the user disconnects.. perform this
	socket.on('disconnect', function() {
		// remove the username from global usernames list
		delete usernames[socket.username];
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
	});
});
