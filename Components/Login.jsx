import React from 'react';
function log(){
    console.log( document.getElementById('username').value,document.getElementById('password').value);
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}
const Login = () =>{
    return(
        <div>
            <div>Username<input id="username"></input></div>
            <div>Password <input id = 'password'></input></div>
            <button id = 'button' onClick = {log}>Login</button>
        </div>
    )
}
export default Login;