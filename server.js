const path = require('path');
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const test = require('./test'); 
app.use(express.json());
app.use(cookieParser());
app.get('/',(req,res)=>{
    if(req.cookies['signed in']=='true'){
        return res.status(200).sendFile(path.resolve(__dirname,'pages','home.html'));
    }else{
        return res.status(200).sendFile(path.resolve(__dirname,'pages','LogSign.html'));
    }
});
app.get('/Home',(req,res)=>{
    res.cookie('signed in',true);
    return res.status(200).sendFile(path.resolve(__dirname,'pages','home.html'));
})
app.post('/checkUser',test.checkUser,(req,res)=>{
    console.log(res.locals);
    return res.send(res.locals.pass);
})
app.post('/addUser',test.addUser,(req,res)=>{
    return res.sendStatus(200);
});
app.get('/Signup',(req,res)=>{
    res.status(200).sendFile(path.resolve(__dirname,'pages','signup.html'));
})
app.listen(3000);