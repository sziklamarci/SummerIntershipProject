require('./PlayerType');
require('./BulletType')

/*
PlayerType :	0 assault
				1 shotgun
				2 minigun
				3 grenade
				
BulletType : 	0 assault
				1 shotgun
				2 minigun
				3 grenade
				100 stun nade
				101 stun pellet
*/

var wallMaxWidth=50;
var wallMinWidth=2;
var wallMaxHeight=50;
var wallMinHeight=2;
var playerSpd=5;
var playerSize=20;
var frag=20;
var pellets=5;
var stunTime = 100;
var invisibleTime = 150;
var shotgunSpread = 20;
var minigunSpread = 20;
var grenadeSpread = 10;


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
				Player.list[i].x = rect1.x-Player.list[i].size/2-1;
			else if (testCollisionRectRect(rect1,rect2) && Player.list[i].pressingLeft)
				Player.list[i].x = rect1.x+rect1.width+Player.list[i].size/2+1;
			else if (testCollisionRectRect(rect1,rect2) && Player.list[i].pressingDown)
				Player.list[i].y = rect1.y-Player.list[i].size/2-1;
			else if (testCollisionRectRect(rect1,rect2) && Player.list[i].pressingUp)
				Player.list[i].y = rect1.y+rect1.height+Player.list[i].size/2+1;
		}
		for(var i in Bullet.list){
			var b = Bullet.list[i];
			var rect1 = {
				x:self.x-self.width/2,
				y:self.y-self.height/2,
				width:self.width,
				height:self.height,
			}
			if(b.type==4 || b.type==100){
				var rect2 = {
					x:b.x-b.size/2+7,
					y:b.y-b.size/2+7,
					width:b.size+14,
					height:b.size+14,
				}
			}else{
				var rect2 = {
					x:b.x-b.size/2+2,
					y:b.y-b.size/2+2,
					width:b.size+4,
					height:b.size+4,
				}
			}
			
			if(b.type==4 || b.type==100){
				if (testCollisionRectRect(rect1,rect2) && rect1.x < rect2.x && rect2.x+rect2.width < rect1.x+rect.width){
					Bullet.list[i].spdY *= -1;
				}else
					Bullet.list[i].spdX *= -1;
			}
			else
			if (testCollisionRectRect(rect1,rect2)){
					Bullet.list[i].timer=Bullet.list[i].deleteTime+1;
					
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
		assault(self);
	}
	if (self.type==1){
		shotgun(self);
	}
	if (self.type==2){
		minigun(self);
	}
	if (self.type==3){
		grenade(self);
	}
	self.number = Math.random();
	self.pressingRight = false;
	self.pressingLeft = false;
	self.pressingUp = false;
	self.pressingDown = false;
	self.pressingAttack = false;
	self.pressingSpec1 = false;
	self.pressingSpec2 = false;
	self.stunned = false;
	self.stunTimer=0;
	self.invisible = false;
	self.invisibleTimer = 0;
	self.mouseAngle = 0;
	self.maxSpd = playerSpd;
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
		
		if (self.stunned){
			self.maxSpd=0;
			self.atkTimer--;
			if (self.stunTimer++>stunTime){
				self.stunned=false;
				self.stunTimer=0;
				self.maxSpd=playerSpd;
			}
		}
		
		if (self.invisible){
			if(self.invisibleTimer++ > invisibleTime){
				self.invisible = false;
				self.invisibleTimer = 0;
			}
		}
		
		if(self.atkTimer<self.atkSpd)
			self.atkTimer++;
		
		if(self.pressingAttack && self.atkTimer >= self.atkSpd && self.ammo > 0){
			if(self.type==0){
				self.shootBullet(self.mouseAngle);
				self.atkTimer=0;
				self.ammo--;
			}else if(self.type==1){
				if (self.spec1Toggle){
					for (var i=0; i<pellets*3; i++){
						self.shootBullet(self.mouseAngle+((shotgunSpread/2)-Math.random()*shotgunSpread*2));
					}
					self.spec1Toggle=false;
				}
				for (var i=0; i < pellets; i++){
						self.shootBullet(self.mouseAngle+((shotgunSpread/2)-Math.random()*shotgunSpread));
				}
				self.atkTimer = 0;
				self.ammo--;
			}else if(self.type == 2){
				self.shootBullet(self.mouseAngle+((minigunSpread/2)-Math.random()*minigunSpread));
				self.atkTimer=0;
				self.ammo--;
			}else if(self.type == 3){
				self.shootBullet(self.mouseAngle+((grenadeSpread/2)-Math.random()*grenadeSpread));
				self.atkTimer=0;
				self.ammo--;
			}
		}
		
		if(self.spec1Timer<self.spec1CD)
			self.spec1Timer++;
		if(self.pressingSpec1&&self.spec1Timer>=self.spec1CD)
			self.spec1();
		
		if(self.spec2Timer<self.spec2CD)
			self.spec2Timer++;
		if(self.pressingSpec2&&self.spec2Timer>=self.spec2CD)
			self.spec2();
		
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
		if(self.pressingRight && !self.pressingLeft)
			self.spdX = self.maxSpd;
		else if(self.pressingLeft &&! self.pressingRight)
			self.spdX = -self.maxSpd;
		else
			self.spdX = 0;
		
		if(self.pressingUp && !self.pressingDown)
			self.spdY = -self.maxSpd;
		else if(self.pressingDown && !self.pressingUp)
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
		assaultB(self);
	}
	else if(type==1){
		var self = Entity(3);
		shotgunB(self);
	}
	else if(type==2){
		var self = Entity(2);
		minigunB(self);
	}
	else if(type==3){
		var self = Entity(5);
		grenadeB(self,distance);
	}
	else if(type==100){
		var self = Entity(5);
		stunB(self);
	}
	else if(type==101){
		var self = Entity(2);
		stunPellet(self);
	}
	self.id = Math.random();
	self.spdX = Math.cos(angle/180*Math.PI) * self.distance/50;
	self.spdY = Math.sin(angle/180*Math.PI) * self.distance/50;
	self.parent = parent;
	self.timer = 0;
	self.toRemove = false;
	var super_update = self.update;
	self.update = function(){
		if(self.timer++ > self.deleteTime){
			self.toRemove = true;
			if(type===3){
				for (i=0; i<frag; i++)
					self.shootBullet(Math.random()*360,2)
			}
			if(type===100)
				for (i=0; i<frag*5; i++)
					self.shootBullet(Math.random()*360,101)
		}
		super_update();
		if(type===3){
			self.spdX /= 1.02;
			self.spdY /= 1.02;
		}
		if(type===100){
			self.spdX /= 1.01;
			self.spdY /= 1.01;
		}
		for(var i in Player.list){
			var killed =false;
			var p = Player.list[i];
			if(self.getDistance(p) < (p.size/2 + self.size/2) && self.parent !== p.id){
				//IDE KELL MAJD A HP - ,stb
				self.toRemove = true;
				Player.list[i].hp-=self.dmg;
				
				if(self.stun){
					Player.list[i].stunned=true;
				}
					
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
						Player.list[j].score+=self.dmg;
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
	
	self.shootBullet = function(angle,type){
		var b = Bullet(self.parent,angle,type,400);
		b.x = self.x;
		b.y = self.y;
	}
	
	Bullet.list[self.id] = self;
	
	return self;
}
Bullet.list = {};
