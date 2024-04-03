import React from 'react';
import Login from '../Components/Login.jsx';
import Test from '../Components/Test.jsx';
import {Routes, Route, Switch} from 'react-router-dom';
const App = () =>{
    return(
        <Routes>
            <Route path='/' element={<Login />}></Route>
            <Route path ='/Login' element = {<Test />}></Route>
        </Routes>
    )
}
export default App;