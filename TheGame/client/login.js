playerName="";
var submitButton = document.getElementById('loginButton');

submitButton.onclick = function(){
    playerName = document.getElementById('chooseName').value;
	spectator = document.getElementById('spectator').checked;
	console.log(playerName);
	sessionStorage.setItem('tarhely', playerName);
	sessionStorage.setItem('spectator',spectator);
	window.open('game.html', '_self');
}
