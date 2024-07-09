const path = require('path');
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const test = require('./test'); 
const e = require('express');
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.resolve(__dirname,'build')));
app.get('/',(req,res)=>{
    if(req.cookies['signed in']=='true'){
       return res.redirect('/Home');
    }else{
        return res.status(200).sendFile(path.resolve(__dirname,'pages','LogSign.html'));
    }
});
app.get('/Home',(req,res)=>{
    if(req.cookies['signed in']=='true'){
        return res.status(200).sendFile(path.resolve(__dirname,'index.html'));
    }else{
        return res.sendFile(path.resolve(__dirname,'pages','redirect.html'));
    }
})
app.post('/checkUser',test.checkUser,(req,res)=>{
    console.log(res.locals);
    return res.send(res.locals.pass);
})
app.post('/addUser',test.addUser,(req,res)=>{
    return res.sendStatus(200);
});
app.get('/Signup',(req,res)=>{
    return res.status(200).sendFile(path.resolve(__dirname,'pages','signup.html'));
})
app.get('/newGame',(req,res)=>{
    if(req.cookies['signed in']=='true'){
        return res.status(200).sendFile(path.resolve(__dirname,'index.html'));
    }else{
        return res.sendFile(path.resolve(__dirname,'pages','redirect.html'));
    }
})
app.get('/kills',test.getKills,(req,res)=>{
    return res.status(200).send([res.locals.kills]);
});
app.put('/addKill',test.getKills,test.addKills,(req,res)=>{
    return res.status(200).send([res.locals.kills+1]);
})
app.get('/deaths',test.getDeaths,(req,res)=>{
    return res.status(200).send([res.locals.deaths]);
});
app.put('/addDeath',test.getDeaths,test.addDeaths,(req,res)=>{
    return res.status(200).send([res.locals.death+1]);
})
app.get('/gamesW',test.getGamesW,(req,res)=>{
    return res.status(200).send([res.locals.gameswon]);
});
app.put('/addGameW',test.getGamesW,test.addGameW,(req,res)=>{
    return res.status(200).send([res.locals.gameswon+1]);
})
app.get('/gamesL',test.getGamesL,(req,res)=>{
    return res.status(200).send([res.locals.gameslost]);
});
app.put('/addGameL',test.getGamesL,test.addGameL,(req,res)=>{
    return res.status(200).send([res.locals.gameslost+1]);
})
app.listen(3000);
