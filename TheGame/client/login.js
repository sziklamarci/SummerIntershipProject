playerName="";
var submitButton = document.getElementById('loginButton');

submitButton.onclick = function(){
    playerName = document.getElementById('chooseName').value;
	console.log(playerName);
	localStorage.setItem('tarhely', playerName);
	window.open('game.html', '_self');
}
