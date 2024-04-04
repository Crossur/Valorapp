import React from 'react';
import {Switch, Link} from 'react-router-dom';
import { useState } from 'react';
const log = async function(){
    const data = await fetch('/Login',{
        method:'POST',
        body:JSON.stringify({
          'username':document.getElementById('username').value,
          'password':document.getElementById('password').value
        }),
        headers: { 'Content-Type': 'application/json' }
    })
    .then(data=>data.json());
    if(data===true){
        location.assign('/Login')
    }else{
        location.assign('/Signup');
    }
}
const LogOrSign = () =>{
    return(
        <div>Login
            <div>Username<input id="username"></input></div>
            <div>Password <input id = 'password'></input></div>
                <button id = 'button' onClick = {log}> Submit
                </button>
        </div>
    )
}
export default LogOrSign;

