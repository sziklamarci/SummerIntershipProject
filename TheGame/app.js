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

var WIDTH = 800;
var HEIGHT = 500;

var Size = 20;

var Entity = function(size){
	var self = {
		x:Math.random()*WIDTH,
		y:Math.random()*HEIGHT,
		size:size,
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

testCollisionRectRect = function(rect1,rect2){
	return rect1.x <= rect2.x+rect2.width 
		&& rect2.x <= rect1.x+rect1.width
		&& rect1.y <= rect2.y + rect2.height
		&& rect2.y <= rect1.y + rect1.height;
}

var Wall = function(){
	var self = Entity(10);
	self.id = Math.random();
	self.width = Math.floor(2+Math.random()*50);
	self.height = Math.floor(2+Math.random()*50);
	self.toRemove = false;
	
	var super_update = self.update;
	self.update = function(){
		self.collision();
		super_update();
	}
	self.collision = function (){
		for(var i in Player.list){
			var p = Player.list[i];
			var rect1 = {
				x:self.x-self.width/2,
				y:self.y-self.height/2,
				width:self.width,
				height:self.height,
			}
			var rect2 = {
				x:Player.list[i].x-Player.list[i].size/2,
				y:Player.list[i].y-Player.list[i].size/2,
				width:Player.list[i].size,
				height:Player.list[i].size,
			}
			if (testCollisionRectRect(rect1,rect2) && Player.list[i].pressingRight)
				Player.list[i].x -= Player.list[i].size/2;
			if (testCollisionRectRect(rect1,rect2) && Player.list[i].pressingLeft)
				Player.list[i].x += Player.list[i].size/2;
			if (testCollisionRectRect(rect1,rect2) && Player.list[i].pressingDown)
				Player.list[i].y -= Player.list[i].size/2;
			if (testCollisionRectRect(rect1,rect2) && Player.list[i].pressingUp)
				Player.list[i].y += Player.list[i].size/2;
		}
		for(var i in Bullet.list){
			var b = Bullet.list[i];
			var rect1 = {
				x:self.x-self.width/2,
				y:self.y-self.height/2,
				width:self.width,
				height:self.height,
			}
			var rect2 = {
				x:Bullet.list[i].x-Bullet.list[i].size/2,
				y:Bullet.list[i].y-Bullet.list[i].size/2,
				width:Bullet.list[i].size,
				height:Bullet.list[i].size,
			}
			if (testCollisionRectRect(rect1,rect2))
				Bullet.list[i].toRemove=true;
		}
	}
	
	Wall.list[self.id] = self;
	return self;
}
Wall.list = {};

var Player = function(id){
	var self = Entity(20);
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
		if(self.x<0 + self.size/2)
			self.x=0+self.size/2;
		if(self.x>WIDTH-self.size/2)
			self.x=WIDTH-self.size/2;
		if(self.y<0+self.size/2)
			self.y=0+self.size/2;
		if(self.y>HEIGHT-self.size/2)
			self.y=HEIGHT-self.size/2;
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
			size:player.size,
			number:player.number
		});		
	}
	return pack;
}

var Bullet = function(parent,angle){
	var self = Entity(5);
	self.id = Math.random();
	self.spdX = Math.cos(angle/180*Math.PI) * 5;
	self.spdY = Math.sin(angle/180*Math.PI) * 5;
	self.parent = parent;
	self.timer = 0;
	self.toRemove = false;
	var super_update = self.update;
	self.update = function(){
		if(self.timer++ > 150)
			self.toRemove = true;
		super_update();
		
		for(var i in Player.list){
			var killed =false;
			var p = Player.list[i];
			if(self.getDistance(p) < 10 && self.parent !== p.id){
				//IDE KELL MAJD A HP - ,stb
				self.toRemove = true;
				if (Player.list[i].hp-- <= 1)
				{
					killed = true; 
					Player.list[i].hp = 10;
					Player.list[i].x=Math.random()*WIDTH;
					Player.list[i].y=Math.random()*HEIGHT;
					Player.list[i].atkSpd = 1;
					Player.list[i].score = Math.floor(Player.list[i].score/2);
				}
				for (var j in Player.list){
					var p2 = Player.list[j];
					if (self.parent === p2.id){
						Player.list[j].score++;
						if (killed){
							Player.list[j].hp+=5;
						}
						killed=false;
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
				size:bullet.size
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
	for(var i in Wall.list){
		delete Wall.list[i];
	}
	Wall();
	Wall();
	Wall();
	Wall();
	Wall();
	
},60000);

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


