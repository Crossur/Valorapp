async function log (){
    const data = await fetch('/user',{
        method:'POST',
        body:JSON.stringify({
          'username':document.getElementById('username').value,
          'password':document.getElementById('password').value
        }),
        headers: { 'Content-Type': 'application/json' }
    })
    .then(data=>data.json());
    if(data===true){
        location.assign('/Home');
    }else{
        confirm('Username/Password Incorrect\n','press cancel to try again or confirm to signup' )
        if(confirm('Username/Password Incorrect\n','press cancel to try again or confirm to signup' )===true){
            location.assign('/Signup');
        }else{
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
        }
    }
}
module.exports = await log;