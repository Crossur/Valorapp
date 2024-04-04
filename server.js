const path = require('path');
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const test = require('./test'); 
app.use(express.json());
app.use(cookieParser());
app.get('/',(req,res)=>{
    if(req.cookies['signed in']=='true'){
        return res.status(200).sendFile(path.resolve(__dirname,'test.html'));
    }else{
        return res.status(200).sendFile(path.resolve(__dirname,'index.html'));
    }
});
app.get('/Login',(req,res)=>{
    res.cookie('signed in',true);
    return res.status(200).sendFile(path.resolve(__dirname,'test.html'));
})
app.post('/Login',test.getUser,(req,res)=>{
    console.log(res.locals);
    return res.send(res.locals.pass);
})
app.get('/Signup',(req,res)=>{
    res.send(200);
})
app.listen(3000);