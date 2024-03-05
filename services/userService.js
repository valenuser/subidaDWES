const { userModel} = require('../models/userModel')



const createUser = async(user) =>{
    const newUser = new userModel({name:user.name,email:user.email,password:user.password,token:user.token})

    await newUser.save()
}

const findUserByEmail = async(email) =>{
    const user = await userModel.find({email:email})

    return user
}


module.exports = {createUser,findUserByEmail}