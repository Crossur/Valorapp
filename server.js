const path = require('path');
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const e = require('express');
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
    return res.status(200).sendFile(path.resolve(__dirname,'login.html'))
})
app.listen(3000);