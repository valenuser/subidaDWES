const {Schema, model} = require('mongoose')


const userSchema =  new Schema({
    name:{type:String},
    email:{type:String, unique:true},
    password:{type:String},
    token:{type:String},
    rol:{type:String, default:'client'},
    favoritos:[]
})



const userModel =  model('users', userSchema)


module.exports = {userModel}