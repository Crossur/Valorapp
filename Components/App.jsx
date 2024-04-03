import React from 'react';
import LogOrSign from './LogOrSign.jsx';
import Test from '../Components/Test.jsx';
import {Routes, Route, Switch, BrowserRouter} from 'react-router-dom';
const App = () =>{
    return(
        <BrowserRouter>
            <LogOrSign/>
        </BrowserRouter>
    )
}
export default App;