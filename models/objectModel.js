const {Schema, model} = require('mongoose')


const objectSchema =  new Schema({
    title:{type:String},
    description:{type:String},
    picture:{type:String},

})



const objectModel =  model('objects', objectSchema)


module.exports = {objectModel}