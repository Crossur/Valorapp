import React from 'react';
import { createRoot } from 'react-dom/client'
import { render } from 'react-dom';
import App from '../Components/App';
import Login from '../Components/Login';
const root = createRoot(document.getElementById('test'));
root.render(<Login/>);