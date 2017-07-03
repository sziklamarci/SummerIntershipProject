var ctx = document.getElementById("ctx").getContext("2d"); 

ctx.font = '30px Arial';

var HEIGHT = document.getElementById("ctx").clientHeight;
var WIDTH = document.getElementById("ctx").clientWidth;
var timeWhenGameStarted = Date.now();	//return time in ms

var frameCount = 0;

var score = 0;
var player;

var enemyList = {};
var upgradeList = {};
var bulletList = {};

testCollisionRectRect = function(rect1,rect2){
	return rect1.x <= rect2.x+rect2.width 
		&& rect2.x <= rect1.x+rect1.width
		&& rect1.y <= rect2.y + rect2.height
		&& rect2.y <= rect1.y + rect1.height;
}

update = function(){
	ctx.clearRect(0,0,WIDTH,HEIGHT);
	frameCount++;
	score++;
	
	if(frameCount % 100 === 0)	//every 4 sec
		randomlyGenerateEnemy();

	if(frameCount % 75 === 0)	//every 3 sec
		randomlyGenerateUpgrade();
	
	player.attackCounter += player.atkSpd;
	
	
	for(var key in bulletList){
		bulletList[key].update();
		
		var toRemove = false;
		bulletList[key].timer++;
		if(bulletList[key].timer > 75){
			toRemove = true;
		}
		
		for(var key2 in enemyList){
			var isColliding = bulletList[key].testCollision(enemyList[key2]);
			if(isColliding){
				toRemove = true;
				delete enemyList[key2];
				break;
			}			
		}
		if(toRemove){
			delete bulletList[key];
		}
	}
	
	for(var key in upgradeList){
		upgradeList[key].update();
		var isColliding = player.testCollision(upgradeList[key]);
		if(isColliding){
			if(upgradeList[key].category === 'score')
				score += 1000;
			if(upgradeList[key].category === 'atkSpd')
				player.atkSpd += 3;
			delete upgradeList[key];
		}
	}
	
	for(var key in enemyList){
		enemyList[key].update();
		
		var isColliding = player.testCollision(enemyList[key]);
		if(isColliding){
			player.hp = player.hp - 1;
		}
	}
	if(player.hp <= 0){
		var timeSurvived = Date.now() - timeWhenGameStarted;		
		console.log("You lost! You survived for " + timeSurvived + " ms.");		
		startNewGame();
	}
	player.update();
	ctx.fillText(player.hp + " Hp",0,30);
	ctx.fillText('Score: ' + score,200,30);
}

startNewGame = function(){
	player.hp = 10;
	timeWhenGameStarted = Date.now();
	frameCount = 0;
	score = 0;
	enemyList = {};
	upgradeList = {};
	bulletList = {};
	randomlyGenerateEnemy();
	randomlyGenerateEnemy();
	randomlyGenerateEnemy();
	
}

player = Player();
startNewGame();

setInterval(update,40);











