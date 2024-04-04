const db = require('./database');
const test = {};
test.save = (user,pass)=>{
    username=user;
    password=pass;
    console.log(user,pass);
}
test.getUser = async(req,res,next)=>{
    console.log(req.body);
    const data = await db.query(
    `select * from users
     where(username='${req.body.username}'and password='${[req.body.password]}');
    `);
    console.log(data.rows[0]);
    console.log(data.rows);
    if(data.rows[0]){
        console.log('hi');
        window.location.reload();
        return next();
    }
}
module.exports = test;