assaultB = function(self){
	self.deleteTime = 150;
	self.dmg = 2;
	self.distance=400;
	self.color = 'black';
}
shotgunB = function(self){
	self.deleteTime = 150;
	self.dmg = 1;
	self.distance=400;
	self.color = 'black';
}
minigunB = function(self){
	self.deleteTime = 200;
	self.dmg = 1;
	self.distance=400;
	self.color = 'black';
}
grenadeB = function(self,distance){
	self.deleteTime = 100;
	self.dmg = 5;
	self.distance=distance;
	self.color = 'DarkOliveGreen';
}
stunB = function(self){
	self.deleteTime = 25;
	self.dmg = 0;
	self.distance=400;
	self.stun=true;
	self.color = 'DarkGrey';
}
stunPellet = function(self){
	self.deleteTime = 8;
	self.dmg = 0;
	self.distance=800;
	self.stun=true;
	self.color = 'Gold';
}
mine = function(self){
	self.deleteTime = 10000000;
	self.dmg = 8;
	self.distance = 0;
	self.color = 'DarkMagenta';
}
