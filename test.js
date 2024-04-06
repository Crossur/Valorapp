const db = require('./database');
const test = {};
const path = require('path');
test.checkUser = async(req,res,next)=>{
    let pass = false;
    //console.log(req.body);
    const data = await db.query(
    `select * from users
     where(username='${req.body.username}'and password='${[req.body.password]}');
    `);
    console.log(data.rows[0]);
    console.log(data.rows);
    if(data.rows[0]!==undefined){
        // res.cookie('signed in',true,{ expires: new Date(Date.now() + 90000)});
        // res.cookie('username',req.body.username,{ expires: new Date(Date.now() + 90000)});
        // res.cookie('password',req.body.password,{ expires: new Date(Date.now() + 90000)});
        res.cookie('signed in',true);
        res.cookie('username',req.body.username);
        res.cookie('password',req.body.password);
        res.locals.pass = true;
    }else{
        res.locals.pass = false;
    }
    return next();
}
test.addUser = async(req,res,next)=>{
    res.cookie('signed in',true);
     res.cookie('username',req.body.username);
    res.cookie('password',req.body.password);
    const data = await db.query(
        `INSERT into users
        VALUES('${req.body.username}','${req.body.password}',${0},${0},${0},${0},${0},${0})
        `
    );
    return next();
}
test.getKills = async(req,res,next)=>{
    const data = await db.query(
        `select kills from users
        where(username='${req.cookies.username}' and password='${req.cookies.password}');`
    );
    res.locals.kills = data.rows[0].kills;
    return next();
}
test.addKills = async(req,res,next)=>{
    res.locals.kills = res.locals.kills;
    const data = await db.query(
       `update users 
       set kills=${res.locals.kills+1}
       where(username='${req.cookies.username}' and password='${req.cookies.password}');`
    );
    return next();
}
test.getDeaths = async(req,res,next)=>{
    const data = await db.query(
        `select deaths from users
        where(username='${req.cookies.username}' and password='${req.cookies.password}');`
    );
    res.locals.deaths = data.rows[0].deaths;
    return next();
}
test.addDeaths = async(req,res,next)=>{
    res.locals.deaths = res.locals.deaths;
    const data = await db.query(
       `update users 
       set deaths=${res.locals.deaths+1}
       where(username='${req.cookies.username}' and password='${req.cookies.password}');`
    );
    return next();
}
test.getGamesW = async(req,res,next)=>{
    const data = await db.query(
        `select roundswon from users
        where(username='${req.cookies.username}' and password='${req.cookies.password}');`
    );
    res.locals.gameswon = data.rows[0].roundswon;
    return next();
}
test.addGameW = async(req,res,next)=>{
    res.locals.gameswon = res.locals.gameswon
    const data = await db.query(
       `update users 
       set roundswon=${res.locals.gameswon+1}
       where(username='${req.cookies.username}' and password='${req.cookies.password}');`
    );
    return next();
}
test.getGamesL = async(req,res,next)=>{
    const data = await db.query(
        `select roundslost from users
        where(username='${req.cookies.username}' and password='${req.cookies.password}');`
    );
    res.locals.gameslost = data.rows[0].roundslost;
    return next();
}
test.addGameL = async(req,res,next)=>{
    res.locals.gameslost = res.locals.gameslost
    const data = await db.query(
       `update users 
       set roundslost=${res.locals.gameslost+1}
       where(username='${req.cookies.username}' and password='${req.cookies.password}');`
    );
    return next();
}
module.exports = test;