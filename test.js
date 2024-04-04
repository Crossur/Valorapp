const db = require('./database');
const test = {};
test.save = (user,pass)=>{
    username=user;
    password=pass;
    console.log(user,pass);
}
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
        console.log('locals');
        res.locals.pass = true;
    }else{
        res.locals.pass = false;
    }
    return next();
}
test.addUser = async(req,res,next)=>{
    console.log('body',req.body);
    const data = await db.query(
        `INSERT into users
        VALUES('${req.body.username}','${req.body.password}')
        `
    );
    return next();
}
module.exports = test;