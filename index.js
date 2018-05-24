var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

var users = {};
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.post('/isUnique',function (req,res){
	if(users[req.body.name]){
		res.json({status: 'taken'});
		return;
	}
	res.json({status: 'okay',guys: Object.keys(users)});
	users[req.body.name] = -1;
});

io.on('connection', function(socket){
	var username = socket.handshake.query.username;
	if(users[username] !== -1){
		socket.disconnect();
		return;
	}
	users[username] = socket;
	socket.username = username;
	socket.broadcast.emit('newGuy',username);
	socket.on('poke',function (username){
		users[username].emit('poked',this.username + ' poked you');
	});
	socket.on('disconnect',function (){
		delete users[this.username];
		socket.broadcast.emit('guyLeft',this.username);
	});
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
