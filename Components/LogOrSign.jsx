import React from 'react';
import {Switch, Link} from 'react-router-dom';
const db = require('../database.js');
async function log(){
    const data = await db.query(`
    INSERT INTO USERS
    VALUES(${document.getElementById('username')},${document.getElementById('password')});
    `);
    location.reload();
}
const LogOrSign = () =>{
    return(
        <div>Login
            <div>Username<input id="username"></input></div>
            <div>Password <input id = 'password'></input></div>
            <button id = 'button' onClick={log}>
                <Link to={"/Login"}
                >Submit</Link>
            </button>
        </div>
    )
}
export default LogOrSign;

// CREATE TABLE Persons (
//     PersonID int,
//     LastName varchar(255),
//     FirstName varchar(255),
//     Address varchar(255),
//     City varchar(255)
// );