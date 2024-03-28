import React from 'react';
import { createRoot } from 'react-dom/client'
import { render } from 'react-dom';
import App from '../Components/App'
const root = createRoot(document.getElementById('test'));
root.render(<App/>);