
document.onclick = function(mouse){
	player.performAttack();
}

document.oncontextmenu = function(mouse){
	player.performSpecialAttack();
	mouse.preventDefault();
}

document.onmousemove = function(mouse){
	var mouseX = mouse.clientX - document.getElementById('ctx').getBoundingClientRect().left;
	var mouseY = mouse.clientY - document.getElementById('ctx').getBoundingClientRect().top;
	
	mouseX -= player.x;
	mouseY -= player.y;
	
	player.aimAngle = Math.atan2(mouseY,mouseX) / Math.PI * 180;
}

document.onkeydown = function(event){
	if(event.keyCode === 68)	//d
		player.pressingRight = true;
	else if(event.keyCode === 83)	//s
		player.pressingDown = true;
	else if(event.keyCode === 65) //a
		player.pressingLeft = true;
	else if(event.keyCode === 87) // w
		player.pressingUp = true;
}

document.onkeyup = function(event){
	if(event.keyCode === 68)	//d
		player.pressingRight = false;
	else if(event.keyCode === 83)	//s
		player.pressingDown = false;
	else if(event.keyCode === 65) //a
		player.pressingLeft = false;
	else if(event.keyCode === 87) // w
		player.pressingUp = false;
}
