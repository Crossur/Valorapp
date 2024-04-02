import React from 'react';
import App from '../Components/App';
import { ReactDOM } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Components/Login';
ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
    <BrowserRouter>
        <Login />
    </BrowserRouter>
</React.StrictMode>
);