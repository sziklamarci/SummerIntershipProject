assault = function(self){
	self.hp = 10;
	self.maxAmmo = 30;
	self.reloadTime = 1000/50 * 4;
	self.atkSpd = 2;
}
shotgun = function(self){
	self.hp = 15;
	self.maxAmmo = 5;
	self.reloadTime = 1000/50 * 6;
	self.atkSpd = 10;
}
minigun = function(self){
	self.hp = 10;
	self.maxAmmo = 100;
	self.reloadTime = 1000/50 * 8;
	self.atkSpd = 0;
}
grenade = function(self){
	self.hp = 10;
	self.maxAmmo = 4;
	self.reloadTime = 1000/50 * 6;
	self.atkSpd = 15;
}