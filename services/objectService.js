const {objectModel} = require('../models/objectModel')


const createObject = async(object) =>{

    const newObject = new objectModel({title:object.title,description:object.description,picture:object.picture})

    await newObject.save()

    return newObject
}

const findObjectById = async(id) =>{
    const object = await objectModel.findById(id)

    return object
}

const findObjects = async()=>{
    const objects = await objectModel.find()

    return objects
}

module.exports = {createObject,findObjectById,findObjects}