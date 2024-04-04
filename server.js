const path = require('path');
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const test = require('./test');
app.use(express.json());
app.use(cookieParser());
// app.get('/',(req,res)=>{
//     if(req.cookies['signed in']=='true'){
//         return res.status(200).sendFile(path.resolve(__dirname,'test.html'));
//     }else{
//         return res.status(200).sendFile(path.resolve(__dirname,'index.html'));
//     }
// });
app.get('/');
app.get('/Login',test.getUser,(req,res)=>{
    res.cookie('signed in',true);
    return res.status(200).sendFile(path.resolve(__dirname,'Components','Test.jsx'));
})
app.post('/Login',test.getUser,(req,res)=>{
    
})
app.listen(3000);