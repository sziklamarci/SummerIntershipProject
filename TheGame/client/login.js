var loginButton = document.getElementById('loginButton');
var loginNameField = document.getElementById('chooseName');




loginButton.style.left = '20px'; 
loginButton.style.top = '350px';

loginNameField.style.left = '20px'; 
loginNameField.style.top = '330px';


//loginNameField.style.top =px';

loginButton.onclick = function(){
    var loginCanvas = document.getElementById('ctx');
    
    loginCanvas.style.visibility = 'visible';
    loginButton.style.visibility = 'hidden';
    loginNameField.style.visibility = 'hidden';
    
}