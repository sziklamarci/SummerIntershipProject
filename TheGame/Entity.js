var wallMaxWidth=50;
var wallMinWidth=2;
var wallMaxHeight=50;
var wallMinHeight=2;
var playerSize=20;
var frag=20;

Entity = function(size){
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

Wall = function(){
	var self = Entity(10);
	if(self.y<50)
		self.y=Math.random()*HEIGHT;
	self.id = Math.random();
	self.width = Math.floor(wallMinWidth+Math.random()*wallMaxWidth);
	self.height = Math.floor(wallMinHeight+Math.random()*wallMaxHeight);
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
				x:b.x-b.size/2,
				y:b.y-b.size/2,
				width:b.size,
				height:b.size,
			}
			if (testCollisionRectRect(rect1,rect2)){
					Bullet.list[i].timer=Bullet.list[i].deleteTime;
			}
		}
	}
	
	Wall.list[self.id] = self;
	return self;
}
Wall.list = {};

Player = function(id){
	var self = Entity(playerSize);
	self.id = id;
	self.type = Math.round(Math.random()*3);
	if (self.type==0){
		self.hp=10;
		self.maxAmmo=30;
		self.reloadTime = 1000/50 * 4;
		self.atkSpd = 2;
		console.log("t0");
	}
	if (self.type==1){
		self.hp=15;
		self.maxAmmo=8;
		self.reloadTime = 1000/50 * 6;
		self.atkSpd = 10;
		console.log("t1");
	}
	if (self.type==2){
		self.hp=10;
		self.maxAmmo=100;
		self.reloadTime = 1000/50 * 8;
		self.atkSpd = 0;
		console.log("t2");
	}
	if (self.type==3){
		self.hp=10;
		self.maxAmmo=4;
		self.reloadTime = 1000/50 * 6;
		self.atkSpd = 15;
		console.log("t3");
	}
	self.number = Math.random();
	self.pressingRight = false;
	self.pressingLeft = false;
	self.pressingUp = false;
	self.pressingDown = false;
	self.pressingAttack = false;
	self.mouseAngle = 0;
	self.maxSpd = 5;
	self.mouseDistance = 0;
	self.atkTimer = 0;
	self.ammo = self.maxAmmo;
	self.reloadTimer = 0;
	self.score = 0;
	
		
	
	var super_update = self.update;
	self.update = function(){
		self.updateSpd();
		self.bounding();
		super_update();
		if(self.pressingAttack&& self.atkTimer++>self.atkSpd && self.ammo > 0){
			if(self.type==0){
				self.shootBullet(self.mouseAngle);
				self.atkTimer=0;
				self.ammo--;
			}else if(self.type==1){
				self.shootBullet(self.mouseAngle+(10-Math.random()*20));
				self.shootBullet(self.mouseAngle+(10-Math.random()*20));
				self.shootBullet(self.mouseAngle+(10-Math.random()*20));
				self.shootBullet(self.mouseAngle+(10-Math.random()*20));
				self.shootBullet(self.mouseAngle+(10-Math.random()*20));
				self.atkTimer=0;
				self.ammo--;
			}else if(self.type==2){
				self.shootBullet(self.mouseAngle+(10-Math.random()*20));
				self.atkTimer=0;
				self.ammo--;
			}else if(self.type==3){
				self.shootBullet(self.mouseAngle+(10-Math.random()*20));
				self.atkTimer=0;
				self.ammo--;
			}
		}
		
		if (self.ammo == 0){
			if (self.reloadTimer++ >= self.reloadTime){
				self.ammo = self.maxAmmo;
				self.reloadTimer = 0;
			}
		}
			
	}
	self.shootBullet = function(angle){
		var b = Bullet(self.id,angle,self.type,self.mouseDistance);
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

Bullet = function(parent,angle,type,distance){
	if(type==0){
		var self = Entity(5);
		self.deleteTime = 150;
		self.dmg = 2;
		self.distance=800;
	}
	else if(type==1){
		var self = Entity(3);
		self.deleteTime = 150;
		self.dmg = 1;
		self.distance=800;
	}
	else if(type==2){
		var self = Entity(2);
		self.deleteTime = 200;
		self.dmg = 1;
		self.distance=800;
	}
	else if(type==3){
		var self = Entity(5);
		self.deleteTime = 100;
		self.dmg = 5;
		self.distance=distance;
	}
	self.id = Math.random();
	self.spdX = Math.cos(angle/180*Math.PI) * distance/50;
	self.spdY = Math.sin(angle/180*Math.PI) * distance/50;
	self.parent = parent;
	self.timer = 0;
	self.toRemove = false;
	var super_update = self.update;
	self.update = function(){
		if(self.timer++ > self.deleteTime){
			self.toRemove = true;
			if(type===3){
				for (i=0; i<frag; i++)
					self.shootBullet(Math.random()*360)
			}
		}
		super_update();
		if(type===2){
			self.spdX /= 1.01;
			self.spdY /= 1.01;
		}
		if(type===3){
			self.spdX /= 1.02;
			self.spdY /= 1.02;
		}
		for(var i in Player.list){
			var killed =false;
			var p = Player.list[i];
			if(self.getDistance(p) < (p.size/2 + self.size/2) && self.parent !== p.id){
				//IDE KELL MAJD A HP - ,stb
				self.toRemove = true;
				Player.list[i].hp-=self.dmg
				if (Player.list[i].hp <= 1)
				{
					killed = true; 
					Player.list[i].hp = 10;
					Player.list[i].x=Math.random()*WIDTH;
					Player.list[i].y=Math.random()*HEIGHT;
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
	
	self.shootBullet = function(angle){
		var b = Bullet(self.id,angle,2,400);
		b.x = self.x;
		b.y = self.y;
	}
	
	Bullet.list[self.id] = self;
	return self;
}
Bullet.list = {};
