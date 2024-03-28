const express = require('express');
const app = express();
const path = require('path');
app.get('/',(req,res)=>{
    res.send(200).sendFile(path.resolve(__dirname,'index.html'))
})
app.listen(3000);