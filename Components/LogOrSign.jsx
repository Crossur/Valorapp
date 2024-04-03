import React from 'react';
import {Switch, Link} from 'react-router-dom';
import { useState } from 'react';
const LogOrSign = () =>{
    const temp = useState([document.getElementById('username'),document.getElementById('password')]);
    return(
        <div>Login
            <div>Username<input id="username"></input></div>
            <div>Password <input id = 'password'></input></div>
            <button id = 'button'>
                <Link to={"/Login"}>Submit</Link>
            </button>
        </div>
    )
}
export default LogOrSign;

