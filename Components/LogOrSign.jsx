import React from 'react';
import {Switch, Link} from 'react-router-dom';
import { useState } from 'react';
const log = async function(){
    await fetch('/Login',{
        method:'POST',
        body:JSON.stringify({
          'username':document.getElementById('username').value,
          'password':document.getElementById('password').value
        }),
        headers: { 'Content-Type': 'application/json' }
    });
    location.reload();
}
const LogOrSign = () =>{
    return(
        <div>Login
            <div>Username<input id="username"></input></div>
            <div>Password <input id = 'password'></input></div>
            <button id = 'button' onClick = {log}>
                <Link to={"/Login"}>Submit</Link>
            </button>
        </div>
    )
}
export default LogOrSign;

