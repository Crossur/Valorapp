import React from 'react';
import {Login} from '../Components/Login'
import {Routes, Route} from 'react-router-dom';
const App = () =>{
    return(
        <Routes>
            <Route path='/' element={<Login />}></Route>
        </Routes>
    )
}
export default App;