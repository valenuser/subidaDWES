const { userModel} = require('../models/userModel')


const createUser = async(user) =>{
    const newUser = new userModel({name:user.name,email:user.email,password:user.password,token:user.token})

    await newUser.save()
}

const findUserByEmail = async(email) =>{
    const user = await userModel.find({email:email})

    return user
}


const  addFavorites = async(user) =>{
    await userModel.findByIdAndUpdate(user[0]._id,{favoritos:user[0].favoritos})
}


const findUsers = async() =>{
    const users = await userModel.find()

    return users
}


const updateUser = async(user) =>{
    await userModel.findByIdAndUpdate(user[0]._id,{password:user[0].password})
}


module.exports = {createUser,findUserByEmail,addFavorites,findUsers,updateUser}