var assaultSpec1CD=20;
var assaultSpec1HpRegen=2;
var assaultSpec2CD=10;
var assaultSpec2Distance=50;
var shotgunSpec1CD=8;
var shotgunSpec2CD=10;
var minigunSpec1CD=12;
var minigunSpec2CD=15;

assault = function(self){
	self.hp = 10;
	self.maxAmmo = 30;
	self.reloadTime = 1000/50 * 4;
	self.atkSpd = 2;
	
	self.spec1CD=50*assaultSpec1CD;
	self.spec1Timer=0;
	self.spec1=function(){
		self.hp+=assaultSpec1HpRegen;
		self.spec1Timer=0;
	}
	
	self.spec2CD=50*assaultSpec2CD;
	self.spec2Timer=0;
	self.spec2=function(){
		self.x += Math.cos(self.mouseAngle/180*Math.PI) * assaultSpec2Distance;
		self.y += Math.sin(self.mouseAngle/180*Math.PI) * assaultSpec2Distance;
		self.spec2Timer=0;
	}
}

shotgun = function(self){
	self.hp = 15;
	self.maxAmmo = 8;
	self.reloadTime = 1000/50 * 6;
	self.atkSpd = 9;
	self.spec1Toggle = false;
	
	self.spec1CD=50*shotgunSpec1CD;
	self.spec1Timer=0;
	self.spec1=function(){
		self.spec1Toggle = true;
		self.spec1Timer=0;
	}
	
	self.spec2CD=50*shotgunSpec2CD;
	self.spec2Timer=0;
	self.spec2=function(){
		var b = Bullet(self.id,self.mouseAngle,100,self.mouseDistance);
		b.x = self.x;
		b.y = self.y;
		self.spec2Timer=0;
	}
}

minigun = function(self){
	self.hp = 10;
	self.maxAmmo = 100;
	self.reloadTime = 1000/50 * 8;
	self.atkSpd = 1;
	
	self.spec1CD=50*minigunSpec1CD;
	self.spec1Timer=0;
	self.spec1=function(){
		self.invisible = true;
		self.spec1Timer=0;
	}
	
	self.spec2CD=50*minigunSpec2CD;
	self.spec2Timer=0;
	self.spec2=function(){
		self.ammo += 100;
		self.spec2Timer = 0;
	}
	
}

grenade = function(self){
	self.hp = 10;
	self.maxAmmo = 4;
	self.reloadTime = 1000/50 * 6;
	self.atkSpd = 15;
}