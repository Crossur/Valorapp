const db = require('./database');
const test = {};
let username;
let password;
test.save = (user,pass)=>{
    username=user;
    password=pass;
    console.log(user,pass);
}
test.getUser = async(req,res,next)=>{
    const data = await db.query(`
    INSERT INTO USERS
    VALUES(${username},${[password]})
    `);
    console.log(data);
}
module.exports = test;