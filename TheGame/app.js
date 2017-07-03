var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

serv.listen(2000);
console.log("Server started.");

var SOCKET_LIST = {};

var Entity = function(){
	var self = {
		x:250,
		y:250,
		spdX:0,
		spdY:0,
		id:"",
	}
	self.update = function(){
		self.updatePosition();
	}
	self.updatePosition = function(){
		self.x += self.spdX;
		self.y += self.spdY;
	}
	self.getDistance = function(pt){
		return Math.sqrt(Math.pow(self.x-pt.x,2) + Math.pow(self.y-pt.y,2));
	}
	return self;
}

var Player = function(id){
	var self = Entity();
	self.id = id;
	self.hp = 10;
	self.number = Math.random();
	self.pressingRight = false;
	self.pressingLeft = false;
	self.pressingUp = false;
	self.pressingDown = false;
	self.pressingAttack = false;
	self.mouseAngle = 0;
	self.maxSpd = 5;
	self.atkTimer = 0;
	self.atkSpd = 1;
	self.score = 0;
	
	var super_update = self.update;
	self.update = function(){
		self.updateSpd();
		self.bounding();
		super_update();
		if(self.pressingAttack&& self.atkTimer++>self.atkSpd){
			self.shootBullet(self.mouseAngle);
			self.atkSpd+=0;
			self.atkTimer=0;
		}
	}
	self.shootBullet = function(angle){
		var b = Bullet(self.id,angle);
		b.x = self.x;
		b.y = self.y;
	}
	
	
	self.bounding = function(){
		if(self.x<0)
			self.x=0;
		if(self.x>500)
			self.x=500;
		if(self.y<0)
			self.y=0;
		if(self.y>500)
			self.y=500;
	}

	
	self.updateSpd = function(){
		if(self.pressingRight)
			self.spdX = self.maxSpd;
		else if(self.pressingLeft)
			self.spdX = -self.maxSpd;
		else
			self.spdX = 0;
		
		if(self.pressingUp)
			self.spdY = -self.maxSpd;
		else if(self.pressingDown)
			self.spdY = self.maxSpd;
		else
			self.spdY = 0;		
	}
	Player.list[id] = self;
	return self;
}
Player.list = {};

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
		else if(data.inputId === 'mouseAngle'){
			var x = data.x-player.x;
			var y = data.y-player.y;
			var angle = Math.atan2(y,x) / Math.PI * 180;
			player.mouseAngle = angle;
		}
		
		socket.emit('playerHp', player.hp);
		socket.emit('playerScore', player.score);
		socket.emit('playerNum', player.number);
	});
	
	console.log("client connected.");
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
			number:player.number
		});		
	}
	return pack;
}

var Bullet = function(parent,angle){
	var self = Entity();
	self.id = Math.random();
	self.spdX = Math.cos(angle/180*Math.PI) * 5;
	self.spdY = Math.sin(angle/180*Math.PI) * 5;
	self.parent = parent;
	self.timer = 0;
	self.toRemove = false;
	var super_update = self.update;
	self.update = function(){
		if(self.timer++ > 100)
			self.toRemove = true;
		super_update();
		
		for(var i in Player.list){
			var p = Player.list[i];
			if(self.getDistance(p) < 10 && self.parent !== p.id){
				//IDE KELL MAJD A HP - ,stb
				self.toRemove = true;
				if (Player.list[i].hp-- <= 1)
				{
					Player.list[i].hp = 10;
					Player.list[i].x=Math.random()*500;
					Player.list[i].y=Math.random()*500;
					Player.list[i].atkSpd = 1;
					Player.list[i].score =0;
				}
				for (var j in Player.list){
					var p2 = Player.list[j];
					if (self.parent === p2.id){
						Player.list[j].score++;
						if (Player.list[i].hp ==10)
							Player.list[j].atkSpd=1;
						break;
					}
				}
			}
		}
	}
	Bullet.list[self.id] = self;
	return self;
}
Bullet.list = {};

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
		var playerName = ("" + socket.id).slice(2,7);
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
	
	var pack = {
		player:Player.update(),
		bullet:Bullet.update(),
	}
	
	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit('newPositions',pack);
	}
	
},1000/50);


