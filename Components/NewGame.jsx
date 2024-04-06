import React from "react";
import { useEffect } from "react";
import { useState } from "react";
let kills = 1;
let deaths = 1;
let roundsW = 1;
let roundsL = 1;
let reasonsForDeath = [];
let reasonsForKill = [];
let num = 0;
const addKill = (upd) =>{
    fetch('/addKill',{
        method:'PUT',
    }).then(add=>add.json()).then(add=>{
        document.getElementById('gKill').innerText = 'Current Kills this game: ' + kills++;
    })
    if(document.getElementById('killsR').value!==''){
        console.log('pressed');
        reasonsForKill.push(document.getElementById('killsR').value);
        upd(reasonsForKill);
        document.getElementById('killsR').value = '';
        let str = '';
        for(const num of reasonsForKill){
            str+=num + '\n'
        }
        document.getElementById('reasonsK').innerText = str;
    }
}
const addDeath = (upd) =>{
    fetch('/addDeath',{
        method:'PUT',
    }).then(add=>add.json()).then(add=>{
        document.getElementById('gDeath').innerText = 'Current Deaths this game: ' + deaths++;
    })
    if(document.getElementById('deathsR').value!==''){
        reasonsForDeath.push(document.getElementById('deathsR').value);
        upd(reasonsForDeath);
        document.getElementById('deathsR').value = '';
        let str = '';
        for(const num of reasonsForDeath){
            str+=num + '\n'
        }
        document.getElementById('reasonsD').innerText = str;
    }
}
const addGameW = () =>{
    fetch('/addGameW',{
        method:'PUT',
    }).then(add=>add.json()).then(add=>{
        console.log('pressed');
    })
    location.assign('/Home')
}
const addGameL = () =>{
    fetch('/addGameL',{
        method:'PUT',
    }).then(add=>add.json()).then(add=>{
        console.log('pressed');
    })
    location.assign('/Home')
}
const NewGame = (props) => {
    const [reasonsD,updReasonsD] = useState([]);
    const [reasonsK,updReasonsK] = useState([]);
    return(
        <section>
            <div id = 'text'>
                <div >Welcome to the interactive game player</div>
                <div> Add kills/deaths and reasons why you</div>
                <div>  got them to help you improve</div>
            </div>
            <div id = 'killA'>
                <div><div id='gKill'>Current Kills this game: 0</div><button id='killB'onClick={()=>{addKill(updReasonsK)}}>Add Kill</button>
                <div><input id = "killsR" placeholder="Reason for kill(optional)"/></div> </div>
                <div id='killP'>Reasons for kills this game:</div>
                <div id = 'reasonsK'></div>
            </div>
            <div id = 'killD'>
                <div><div id='gDeath'>Current Deaths this game: 0</div><button id = "dButton" onClick={()=>{addDeath(updReasonsD)}}>Add Death</button></div>
                <div><input id = "deathsR" placeholder="Reason for Death(optional)"/></div>
                 <div id='killL'>Reasons for deaths this game:</div>
                <div id = 'reasonsD'></div>
            </div>
            <div><button id='buttonW' onClick={addGameW}> Game Won!</button></div>
            <div><button id = 'buttonL'onClick={addGameL}> Game Lost </button></div>
            <div id='valoraid2'>VALORAID</div>
        </section>
    )
}
// onClick={incrementKills}
// onClick={incrementDeaths}
export default NewGame;

