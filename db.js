const mongoose = require('mongoose')

const dotenv = require('dotenv')

dotenv.config({path:'.env'})

const db = () =>{
    mongoose.connect(process.env.URI_MONGO)
}

try{
    db()

    mongoose.connection.on('open',()=>{
        console.log('conexion exitosa');
    })
}catch(e){
    mongoose.connection.on('error',()=>{
        console.log(e);
    })
}


module.exports = {db}

