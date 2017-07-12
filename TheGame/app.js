var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.use(express.static('./client'));

serv.listen(2000);
console.log("Server started.");

require('./Entity');

var SOCKET_LIST = {};

WIDTH = 800;
HEIGHT = 500;

var MapChangeTime = 60;
var MapChangeTimer = 1;
var Size = 20;

testCollisionRectRect = function(rect1,rect2){
	return rect1.x <= rect2.x+rect2.width
		&& rect2.x <= rect1.x+rect1.width
		&& rect1.y <= rect2.y + rect2.height
		&& rect2.y <= rect1.y + rect1.height;
}


Player.onConnect = function(socket){
	var player = Player(socket.id);
	socket.on('keyPress',function(data){
		if(data.inputId === 'left')
			player.pressingLeft = data.state;
		else if(data.inputId === 'right')
			player.pressingRight = data.state;
		else if(data.inputId === 'up')
			player.pressingUp = data.state;
		else if(data.inputId === 'down')
			player.pressingDown = data.state;
		else if(data.inputId === 'attack')
			player.pressingAttack = data.state;
		else if(data.inputId === 'spec1')
			player.pressingSpec1 = data.state;
		else if(data.inputId === 'spec2')
			player.pressingSpec2 = data.state;
		else if(data.inputId === 'mouseAngle'){
			var x = data.x-player.x;
			var y = data.y-player.y;
			var angle = Math.atan2(y,x) / Math.PI * 180;
			player.mouseAngle = angle;
			player.mouseDistance = Math.sqrt(Math.pow(x,2) + Math.pow(y,2));
		}

		socket.emit('playerHp', player.hp);
		socket.emit('playerScore', player.score);
		socket.emit('playerNum', player.number);
		socket.emit('playerAmmo',player.ammo);
		socket.emit('playerSpec1CD',player.spec1CD);
		socket.emit('playerSpec1Timer',player.spec1Timer);
		socket.emit('playerSpec2CD',player.spec2CD);
		socket.emit('playerSpec2Timer',player.spec2Timer);
		socket.emit('playerDead',player.dead);
		socket.emit('playerDeadTimer',player.deadTimer);
	});
	console.log("client connected.");

	socket.on('setPlayerName',function(data){
			Player.list[socket.id].name = data;
	});
}
Player.onDisconnect = function(socket){
	delete Player.list[socket.id];
	console.log("client disconnected.");
}
Player.update = function(){
	var pack = [];
	for(var i in Player.list){
		var player = Player.list[i];
		player.update();
		pack.push({
			x:player.x,
			y:player.y,
			size:player.size,
			number:player.number,
			name:player.name,
			score:player.score,
			invisible:player.invisible
		});
	}

	return pack;
}

Bullet.update = function(){
	var pack = [];
	for(var i in Bullet.list){
		var bullet = Bullet.list[i];
		bullet.update();
		if(bullet.toRemove)
			delete Bullet.list[i];
		else
			pack.push({
				x:bullet.x,
				y:bullet.y,
				size:bullet.size,
				color:bullet.color
			});
	}
	return pack;
}

Wall.update = function(){
	var pack = [];
	for(var i in Wall.list){
		var wall = Wall.list[i];
		wall.update();
		pack.push({
			x:wall.x,
			y:wall.y,
			width:wall.width,
			height:wall.height
		});
	}
	return pack;
}

var DEBUG = true;

var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;
	Player.onConnect(socket);

	socket.on('disconnect',function(){
		delete SOCKET_LIST[socket.id];
		Player.onDisconnect(socket);
	});
	socket.on('sendMsgToServer',function(data){
		var playerName = Player.list[socket.id].name;
		for(var i in SOCKET_LIST){
			SOCKET_LIST[i].emit('addToChat',playerName + ': ' + data);
		}
	});

	socket.on('evalServer',function(data){
		if(!DEBUG)
			return;
		var res = eval(data);
		socket.emit('evalAnswer',res);
	});


});

setInterval(function(){
	if (MapChangeTimer-- <= 0){
		for(var i in Wall.list){
			delete Wall.list[i];
		}
		generateHouse();
		generateHouse();
		generateHouse();
		//Wall(Wall.list[Wall.list.length-1].x+Wall.list[Wall.list.length-1].width,Wall.list[Wall.list.length-1].y+Wall.list[Wall.list.length-1].height)
		MapChangeTimer = MapChangeTime;
	}
	for (var i in Player.list)
	{
		if(Player.list[i].dead)
			Player.list[i].deadTimer--;
	}
	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit('TimeToChange',MapChangeTimer);
	}
},1000);

setInterval(function(){

	var pack = {
		player:Player.update(),
		bullet:Bullet.update(),
		wall:Wall.update(),
	}

	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit('newPositions',pack);
	}
},1000/50);
