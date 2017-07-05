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

Player = function(id){
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
	self.maxAmmo =30;
	self.ammo = self.maxAmmo;
	self.reloadTime = 1000/50 * 3;
	self.reloadTimer = 0;
	self.score = 0;
	
	var super_update = self.update;
	self.update = function(){
		self.updateSpd();
		self.bounding();
		super_update();
		if(self.pressingAttack&& self.atkTimer++>self.atkSpd && self.ammo > 0){
			self.shootBullet(self.mouseAngle);
			self.atkSpd+=0;
			self.atkTimer=0;
			self.ammo--;
		}
		
		if (self.ammo == 0){
			if (self.reloadTimer++ >= self.reloadTime){
				self.ammo = self.maxAmmo;
				self.reloadTimer = 0;
			}
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

Bullet = function(parent,angle){
	var self = Entity(5);
	self.id = Math.random();
	self.spdX = Math.cos(angle/180*Math.PI) * 8;
	self.spdY = Math.sin(angle/180*Math.PI) * 8;
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
			if(self.getDistance(p) < p.size/2 && self.parent !== p.id){
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
