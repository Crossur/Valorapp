import React from 'react';
import {Switch, Link} from 'react-router-dom';
function log(name,password){

}
const Login = () =>{
    return(
        <div>
            <div>Username<input id="username"></input></div>
            <div>Password <input id = 'password'></input></div>
            <button id = 'button'>
                <Link to={{
                    pathname:"/Login",  state:{fromDashboard: true} 
                }}
                >Login</Link>
            </button>
        </div>
    )
}
export default Login;