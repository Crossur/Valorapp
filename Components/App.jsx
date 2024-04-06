import React from 'react';
import Home from './Home.jsx';
import NewGame from './NewGame.jsx';
import {Routes, Route, BrowserRouter} from 'react-router-dom';
import { useState } from "react";
import '../stylesheets/styles.css';
const App = () =>{
    let [deaths,addDeaths] = useState(0);
    let [reasonsForDeath,addReasonD] = useState([]);
    let [reasonsForKill,addReasonK] = useState([]);
    return(
        <BrowserRouter>
            <Routes>
                <Route path='/Home' element={<Home deaths={deaths} reasonsForDeath={reasonsForDeath} reasonsForKill={reasonsForKill}/>}></Route>
                <Route path='/newGame' element={<NewGame deaths={deaths} reasonsForDeath={reasonsForDeath} reasonsForKill={reasonsForKill} addDeaths={addDeaths} addReasonD={addReasonD} addReasonK={addReasonK}/>}></Route>
            </Routes>
        </BrowserRouter>
    )
}
export default App;