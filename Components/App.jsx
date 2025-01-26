import { useState } from "react";

import React, {Suspense, lazy} from 'react';
const Home = lazy(() => import('./Home'));
const NewPage = lazy(() => import('./NewPage'));


import {Navigate} from 'react-router-dom';
const App = () =>{
  return(
    <Navigate to='/login' />
)
}
export default App;