import React from 'react';
import { useState } from 'react';
import NewGame from './NewGame';
const call = async () =>{
    const data = await fetch('https://valorant-api.com/v1/agents').then(data=>data.json());
    return data;
}
const newGame = () =>{
    location.assign('/newGame')
}
const Home = (props) => {
    let renderKD = fetch('/deaths').then(d=>d.json()).then(d=>{
        fetch('/kills').then(k=>k.json()).then(k=>{
            document.getElementById('kills').innerHTML = 'Total Kills since using valoraid: ' + k[0]
            document.getElementById('deaths').innerHTML = 'Total Deaths since using valoraid: ' + d[0]
            console.log(typeof(k[0]/d[0]));
            if(isNaN(k[0]/d[0])){
                document.getElementById('kd').innerHTML = 'K/D ratio since using valoraid: ' + 0;
            }else{
                document.getElementById('kd').innerHTML = 'K/D ratio since using valoraid: ' + (Math.round((k[0]/d[0])*100)/100);
            }
            if(!isFinite(k[0]/d[0])){
                document.getElementById('kd').innerHTML = 'K/D ratio since using valoraid: ' + k[0];
            }else{
                document.getElementById('kd').innerHTML = 'K/D ratio since using valoraid: ' + (Math.round((k[0]/d[0])*100)/100);
            }
            fetch('/gamesW').then(w=>w.json()).then(w=>{
                fetch('/gamesL').then(l=>l.json()).then(l=>{
                    document.getElementById('roundsW').innerHTML = 'Total Games won since using valoraid: ' + w[0];
                    document.getElementById('roundsL').innerHTML = 'Total Games lost since using valoraid: ' + l[0];
                    if(isNaN(w[0]/l[0] )){
                        document.getElementById('wl').innerHTML = 'W/L ratio since using valoraid: ' + 0;
                    }else{
                        document.getElementById('wl').innerHTML = 'W/L ratio since using valoraid: ' + (Math.round((w[0]/l[0])*100)/100);
                    }
                    if(!isFinite(w[0]/l[0])){
                        document.getElementById('wl').innerHTML = 'W/L ratio since using valoraid: ' + w[0];
                    }else{
                        document.getElementById('wl').innerHTML = 'W/L ratio since using valoraid: ' + (Math.round((w[0]/l[0])*100)/100);
                    }
                })
            }) 
        })
    })
    return(
        <div>
            <div id = 'stats'>
                <div id = 'kills'></div>
                <div id ='deaths'></div>
                <div id='kd'></div>
                <div id='roundsW'></div>
                <div id='roundsL'></div>
                <div id='wl'></div>
            </div >s
            <div id ='valoraid'>VALORAID</div>
            <button id='play'onClick={newGame}>Play new Game</button>
        </div>
    )
}
export default Home;

