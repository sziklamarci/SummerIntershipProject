
randomlyGenerateEnemy = function(){
	//Math.random() returns a number between 0 and 1
	var x = Math.random()*WIDTH;
	var y = Math.random()*HEIGHT;
	var height = 10 + Math.random()*30;	//between 10 and 40
	var width = 10 + Math.random()*30;
	var id = Math.random();
	var spdX = 5 + Math.random() * 5;
	var spdY = 5 + Math.random() * 5;
	Enemy(id,x,y,spdX,spdY,width,height);
	
}

randomlyGenerateUpgrade = function(){
	//Math.random() returns a number between 0 and 1
	var x = Math.random()*WIDTH;
	var y = Math.random()*HEIGHT;
	var height = 10;
	var width = 10;
	var id = Math.random();
	var spdX = 0;
	var spdY = 0;
	
	if(Math.random()<0.5){
		var category = 'score';
		var color = 'orange';
	} else {
		var category = 'atkSpd';
		var color = 'purple';
	}
	
	Upgrade(id,x,y,spdX,spdY,width,height,color,category);
}

generateBullet = function(actor,aimOverwrite){
	//Math.random() returns a number between 0 and 1
	var x = actor.x;
	var y = actor.y;
	var height = 10;
	var width = 10;
	var id = Math.random();
	
	var angle;
	if(aimOverwrite !== undefined)
		angle = aimOverwrite;
	else angle = actor.aimAngle;
	
	var spdX = Math.cos(angle/180*Math.PI)*5;
	var spdY = Math.sin(angle/180*Math.PI)*5;
	Bullet(id,x,y,spdX,spdY,width,height);
}
