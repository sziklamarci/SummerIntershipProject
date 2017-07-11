var chatText = document.getElementById('chat-text');
var chatInput = document.getElementById('chat-input');
var chatForm = document.getElementById('chat-form');
var ctx = document.getElementById("ctx").getContext("2d");
ctx.font = '15px Arial';
var leaderboardNameList = document.getElementById("leaderboardNameList"); 
var leaderboardScoreList = document.getElementById("leaderboardScoreList");


var socket = io();
var hp = 10;
var score = 0;
var num = 0;
var TimeToChange = 0;
var ammo;
var spec1CD = 0;
var spec1Timer = 0;
var spec2CD = 0;
var spec2Timer = 0;

var playerName = sessionStorage.getItem('tarhely');
<<<<<<< HEAD
=======

if (playerName === "")
    {
        playerName = 'unnamed';
    }
>>>>>>> 6bc96c5401d327a5c8448e3440e4cc2b15438647
socket.emit('setPlayerName',playerName);

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
socket.on('playerSpec1CD',function(data){
	spec1CD = data;
});
socket.on('playerSpec1Timer',function(data){
	spec1Timer = data;
});
socket.on('playerSpec2CD',function(data){
	spec2CD = data;
});
socket.on('playerSpec2Timer',function(data){
	spec2Timer = data;
});
socket.on('newPositions',function(data){
	ctx.clearRect(0,0,800,500);
	leaderboardClear();
	for(var i = 0 ; i < data.player.length; i++){
		ctx.font = '9px Arial'
		if (data.player[i].number == num){
			ctx.fillStyle = 'green';
			if (data.player[i].invisible)
				ctx.fillStyle = 'WhiteSmoke';
		}else{
			ctx.fillStyle = 'red';
			if (data.player[i].invisible){
				ctx.fillStyle = 'White';
				ctx.font = '0px Arial';
			}
		}
			ctx.fillRect(data.player[i].x - (data.player[i].size/2),data.player[i].y- (data.player[i].size/2),data.player[i].size,data.player[i].size)
			ctx.fillText(data.player[i].name, data.player[i].x-5,data.player[i].y - (data.player[i].size+5));
        
        leaderboardUpdate(data.player[i].name, data.player[i].score); 
        
        
        
        
		}
   
    
    
    
    
	for(var i = 0 ; i < data.bullet.length; i++){
		ctx.fillStyle = data.bullet[i].color;
		ctx.fillRect(data.bullet[i].x-(data.bullet[i].size/2),data.bullet[i].y-(data.bullet[i].size/2),data.bullet[i].size,data.bullet[i].size);
	}
	for(var i = 0 ; i < data.wall.length; i++){
		ctx.fillStyle = 'black';
		ctx.fillRect(data.wall[i].x-(data.wall[i].width/2),data.wall[i].y-(data.wall[i].height/2),data.wall[i].width,data.wall[i].height);
	}
	ctx.fillStyle = 'black';
	
	ctx.font = '15px Arial';
	ctx.fillText("HP: " + hp, 5,15);
	ctx.fillText("Q: " + Math.round(spec1Timer/spec1CD*100) + "%", 80,15);
	ctx.fillText("E: " + Math.round(spec2Timer/spec2CD*100) + "%", 140,15);
	ctx.fillText("Time to change: " + TimeToChange, 390,15);
	ctx.fillText("Ammo: " + ammo, 590, 15);
	ctx.fillText("score: " + score, 690,15);
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
	else if(event.keyCode === 81) // q
		socket.emit('keyPress',{inputId:'spec1',state:true});	
	else if(event.keyCode === 69) // e
		socket.emit('keyPress',{inputId:'spec2',state:true});
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
	else if(event.keyCode === 81) // q
		socket.emit('keyPress',{inputId:'spec1',state:false});
	else if(event.keyCode === 69) // e
		socket.emit('keyPress',{inputId:'spec2',state:false});
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

//////////////////// LEADERBOARD ///////////////////////

function leaderboardUpdate(nameListElement, scoreListElement) {
    
   
    
    var li = document.createElement("li"); 
    li.appendChild(document.createTextNode(nameListElement));
    leaderboardNameList.appendChild(li);
    
    var li2 = document.createElement("li"); 
    li2.appendChild(document.createTextNode(scoreListElement));
    leaderboardScoreList.appendChild(li2);
}

function leaderboardClear() {
    leaderboardNameList.innerHTML = "";
    leaderboardScoreList.innerHTML = "";
}


