var chatText = document.getElementById('chat-text');
var chatInput = document.getElementById('chat-input');
var chatForm = document.getElementById('chat-form');
var ctx = document.getElementById("ctx").getContext("2d");
ctx.font = '20px Arial';

var socket = io();
var hp = 10;
var score = 0;
var num = 0;
var TimeToChange = 0;
var ammo;
socket.on('playerHp',function(data){
	hp = data;
});
socket.on('playerScore',function(data){
	score = data;
});
socket.on('playerNum',function(data){
	num = data;
});
socket.on('TimeToChange',function(data){
	TimeToChange = data;
});
socket.on('playerAmmo',function(data){
	ammo = data;
});

socket.on('newPositions',function(data){
	ctx.clearRect(0,0,800,500);
	
	for(var i = 0 ; i < data.player.length; i++){
		if (data.player[i].number == num){
			ctx.fillStyle = 'green';
		}else{
			ctx.fillStyle = 'red';
		}
		ctx.fillRect(data.player[i].x - (data.player[i].size/2),data.player[i].y- (data.player[i].size/2),data.player[i].size,data.player[i].size)
		}
	for(var i = 0 ; i < data.bullet.length; i++){
		ctx.fillStyle = 'black';
		ctx.fillRect(data.bullet[i].x-(data.bullet[i].size/2),data.bullet[i].y-(data.bullet[i].size/2),data.bullet[i].size,data.bullet[i].size);
	}
	for(var i = 0 ; i < data.wall.length; i++){
		ctx.fillStyle = 'black';
		ctx.fillRect(data.wall[i].x-(data.wall[i].width/2),data.wall[i].y-(data.wall[i].height/2),data.wall[i].width,data.wall[i].height);
	}
	ctx.fillStyle = 'black';
	ctx.fillText("HP: " + hp, 2,25);
	ctx.fillText("Time to change: " + TimeToChange, 150,25);
	ctx.fillText("score: " + score, 650,25);
	ctx.fillText("Ammo: " + ammo, 470, 25);
});
	
	
socket.on('addToChat',function(data){
	chatText.innerHTML += '<div>' + data + '</div>';
});
socket.on('evalAnswer',function(data){
	console.log(data);
});
	
	
chatForm.onsubmit = function(e){
	e.preventDefault();
	if(chatInput.value[0] === '/')
		socket.emit('evalServer',chatInput.value.slice(1));
	else
		socket.emit('sendMsgToServer',chatInput.value);
	chatInput.value = '';		
}
	
document.onkeydown = function(event){
	if(event.keyCode === 68)	//d
		socket.emit('keyPress',{inputId:'right',state:true});
	else if(event.keyCode === 83)	//s
		socket.emit('keyPress',{inputId:'down',state:true});
	else if(event.keyCode === 65) //a
		socket.emit('keyPress',{inputId:'left',state:true});
	else if(event.keyCode === 87) // w
		socket.emit('keyPress',{inputId:'up',state:true});
		
}
document.onkeyup = function(event){
	if(event.keyCode === 68)	//d
		socket.emit('keyPress',{inputId:'right',state:false});
	else if(event.keyCode === 83)	//s
		socket.emit('keyPress',{inputId:'down',state:false});
	else if(event.keyCode === 65) //a
		socket.emit('keyPress',{inputId:'left',state:false});
	else if(event.keyCode === 87) // w
		socket.emit('keyPress',{inputId:'up',state:false});
}
	
document.onmousedown = function(event){
	socket.emit('keyPress',{inputId:'attack',state:true});
}
document.onmouseup = function(event){
	socket.emit('keyPress',{inputId:'attack',state:false});
}
document.onmousemove = function(event){
    var topNavHeight = document.getElementById("topnav").clientHeight;
    var html = document.getElementsByTagName("body")[0];
    var style = window.getComputedStyle(html);
    var marginTop = parseInt(style.getPropertyValue('margin-left'),10);
    
   
    // to do
	var x = event.clientX - marginTop - 1;
	var y = event.clientY - topNavHeight - marginTop - 1;
    
	socket.emit('keyPress',{inputId:'mouseAngle',x:x,y:y});
}
