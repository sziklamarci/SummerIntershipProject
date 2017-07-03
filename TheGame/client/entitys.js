
Entity = function(type,id,x,y,spdX,spdY,width,height,color){
	var self = {
		type:type,
		x:x,
		spdX:spdX,
		y:y,
		spdY:spdY,
		width:width,
		height:height,
		color:color,
	};
	self.update = function(){
		self.updatePosition();
		self.draw();
	}
	self.updatePosition = function(){
		if(self.type === 'player'){
			if(self.pressingRight)
				self.x += 10;
			if(self.pressingLeft)
				self.x -= 10;	
			if(self.pressingDown)
				self.y += 10;	
			if(self.pressingUp)
				self.y -= 10;	
			
			//ispositionvalid
			if(self.x < self.width/2)
				self.x = self.width/2;
			if(self.x > WIDTH-self.width/2)
				self.x = WIDTH - self.width/2;
			if(self.y < self.height/2)
				self.y = self.height/2;
			if(self.y > HEIGHT - self.height/2)
				self.y = HEIGHT - self.height/2;
		
		} else {
			self.x += self.spdX;
			self.y += self.spdY;
					
			if(self.x < 0 || self.x > WIDTH){
				self.spdX = -self.spdX;
			}
			if(self.y < 0 || self.y > HEIGHT){
				self.spdY = -self.spdY;
			}
		}
	}
	self.getDistance = function (entity2){	//return distance (number)
		var vx = self.x - entity2.x;
		var vy = self.y - entity2.y;
		return Math.sqrt(vx*vx+vy*vy);
	}
	self.testCollision = function(entity2){	//return if colliding (true/false)
		var rect1 = {
			x:self.x-self.width/2,
			y:self.y-self.height/2,
			width:self.width,
			height:self.height,
		}
		var rect2 = {
			x:entity2.x-entity2.width/2,
			y:entity2.y-entity2.height/2,
			width:entity2.width,
			height:entity2.height,
		}
		return testCollisionRectRect(rect1,rect2);
	}
	self.draw = function(){
		ctx.save();
		ctx.fillStyle = self.color;
		ctx.fillRect(self.x-self.width/2,self.y-self.height/2,self.width,self.height);
		ctx.restore();
	}
	
	return self;
}

Actor = function(type,id,x,y,spdX,spdY,width,height,color){
	var self = Entity(type,id,x,y,spdX,spdY,width,height,color);
	
	self.attackCounter = 0;
	self.aimAngle = 0;
	self.atkSpd = 1;
	
	self.performAttack = function(){
		if(self.attackCounter > 25){	//every 1 sec
			self.attackCounter = 0;
			generateBullet(self);
		}
	}
	self.performSpecialAttack = function(){
		if(self.attackCounter > 50){	//every 1 sec
			self.attackCounter = 0;
			/*
			for(var i = 0 ; i < 360; i++){
				generateBullet(self,i);
			}
			*/
			generateBullet(self,self.aimAngle - 5);
			generateBullet(self,self.aimAngle);
			generateBullet(self,self.aimAngle + 5);
		}
	}
	return self;
}

Player = function(){
	var p = Actor('player','myId',50,40,30,5,20,20,'green');
		
	p.pressingDown = false;
	p.pressingUp = false;
	p.pressingLeft = false;
	p.pressingRight = false;
	return p;
}

Enemy = function(id,x,y,spdX,spdY,width,height){
	var self = Actor('enemy',id,x,y,spdX,spdY,width,height,'red');
	enemyList[id] = self;
}

Upgrade = function(id,x,y,spdX,spdY,width,height,color,category){
	var self = Entity('upgrade',id,x,y,spdX,spdY,width,height,color);
	self.category = category;
	upgradeList[id] = self;
}

Bullet = function (id,x,y,spdX,spdY,width,height){
	var self = Entity('bullet',id,x,y,spdX,spdY,width,height,'black');
	self.timer = 0;
	bulletList[id] = self;
}
