const express = require('express')

const bcrypt = require('bcryptjs')

const jwt =  require('jsonwebtoken')

const {body,validationResult} = require('express-validator')

const { createUser, findUserByEmail, addFavorites, findUsers,updateUser}  = require('../services/userService')
const { createObject,findObjectById, findObjects}  = require('../services/objectService')

const dotenv =  require('dotenv')


const router = express.Router()

dotenv.config({path:'../.env'})


router.get('/',(req,res)=>{
    if(req.session.loggead){
            const { email, rol } = jwt.decode(req.session.token,process.env.SECRET_TOKEN_CLIENT)

            const data = {
                rol:rol,
                name:req.session.name
            }
            res.render('index',{data})
    }else{
        res.render('index')
    }

})
router.get('/login',(req,res)=>{
    res.render('login')
})
router.get('/register',(req,res)=>{
    res.render('register')
})

router.get('/logout',(req,res)=>{
    req.session.destroy()
    res.redirect('/')
})

router.get('/all',async(req,res)=>{

    try{
        const { email, rol } = jwt.decode(req.session.token,process.env.SECRET_TOKEN_CLIENT)
    
        const user = await findUserByEmail(email)
        
        const data = {
            rol:rol,
            objects: user[0].favoritos
        }

        console.log(data.objects);
    
        res.render('all',{data})
    }catch(e){
        res.redirect('/error')
    }
})
router.get('/add',async(req,res)=>{

    try{
        const { email, rol } = jwt.decode(req.session.token,process.env.SECRET_TOKEN_CLIENT)
    
        const user = await findUserByEmail(email)
        
        const data = {
            rol:rol
        }
    
        res.render('add',{data})
    }catch(e){
        res.redirect('/error')
    }
})


router.get('/delete/:id',async(req,res)=>{
    const {id} = req.params


    const { email } = jwt.decode(req.session.token,process.env.SECRET_TOKEN_CLIENT)
    
    const user = await findUserByEmail(email)

    const newFavorites = user[0].favoritos.filter(el => el._id != id)

    user[0].favoritos = newFavorites

    await addFavorites(user)

    res.redirect('/all')
})


router.get('/update/:id',async(req,res)=>{
    const {id} = req.params

    try{
        const object = await findObjectById(id)

        const data = {
            object:object,
            rol:'client'
        }
        res.render('update',{data})
    }catch(e){
        res.redirect('/error')
    }

})



router.get('/users',async(req,res)=>{
        try{
            const data =  await findUsers()

            console.log(data);

            res.render('users',{data})
        }catch(e){
            console.log(e);
            res.render('users')
        }
})

router.get('/objects',async(req,res)=>{
        try{
            const data =  await findObjects()

            console.log(data);

            res.render('objects',{data})
        }catch(e){
            console.log(e);
            res.render('objects')
        }
})



router.get('/reset',(req,res)=>{
    res.render('resetPassword')
})


router.get('/resetPassword/:token',(req,res)=>{
    const token = jwt.decode(req.params.token,process.env.SECRET_RESET)

    if(token != null){

        const { email } = token
    
    
        const data = {
            email:email
        }
    
        res.render('resetFormulario',{data})
    }else{
        res.redirect('/noPermission')
    }
})

router.get('/noPermission',(req,res)=>{
    res.render('badToken')
})

//method post

router.post('/register',[
    body('name','Introduce un nombre valido').exists().isLength({min:3,max:20}),
    body('email','Introduce un email valido').exists().isEmail(),
    body('password','Introduce una contraseña segura').exists().isLength({min:5,max:10})
],async(req,res)=>{
    const verify = validationResult(req)

    if(!verify.isEmpty()){
        const error = verify.array()

        res.render('register',{error})
    }else{

        const { name,email,password } = req.body

        const token = jwt.sign({rol:'client',email:email},process.env.SECRET_TOKEN_CLIENT)

        const newPassword = await bcrypt.hash(password,8)

        const user = {
            name:name,
            email:email,
            password:newPassword,
            token:token
        }

        try{
            await createUser(user)

            req.session.loggead = true
            req.session.token =  token
            req.session.name = name
            res.redirect('/')


        }catch(e){
            const error = [
                {
                    msg:'El email indicado ya ha sido registrado'
                }
            ]

            res.render('register',{error})
        }

    }
})


router.post('/login',[
    body('email','Introduce un email valido').exists().isEmail(),
    body('password','Introduce una contraseña').exists().isLength({min:5,max:10})
],async(req,res)=>{

    const verify = validationResult(req)

    if(!verify.isEmpty()){
        const error = verify.array()

        res.render('login',{error})
    }else{

        const { email,password } = req.body

        try{

            const user = await findUserByEmail(email)

            
            if(user.length != 0){
                const compare = await bcrypt.compare(password,user[0].password)
                if(compare){

                    req.session.loggead = true,
                    req.session.token = user[0].token
                    req.session.name =user[0].name
                    res.redirect('/')
                }else{
                    const error = [
                        {
                            msg:'Contraseña incorrecta'
                        }
                    ]
                    res.render('login',{error})
                }
            }else{
                res.redirect('/register')
            }
        }catch(e){
            const error = [
                {
                    msg:'Hubo un problema al iniciar sesion, por favor intentelo de nuevo.'
                }
            ]
            res.render('login',{error})
        }

    }
    
})


router.post('/add',[
    body('title','Introduce un titulo').exists().isLength({min:4,max:20}),
    body('description','Introduce una description').exists().isLength({min:5}),
    body('picture','Introduce url de una imagen').exists().isLength({min:5})
],async(req,res)=>{

    const verify = validationResult(req)

    if(!verify.isEmpty()){
        const error = verify.array()

        const { email, rol } = jwt.decode(req.session.token,process.env.SECRET_TOKEN_CLIENT)
        const data = {
            rol:rol
        }
    
        res.render('add',{error,data})
    }else{

        const { title,description,picture } = req.body

        try{    

            const object = {
                title:title,
                description:description,
                picture:picture
            }


            const objectSaved = await createObject(object)

            const { email } = jwt.decode(req.session.token,process.env.SECRET_TOKEN_CLIENT)
    
            const user = await findUserByEmail(email)

            user[0].favoritos.push(objectSaved)

            await addFavorites(user)

            res.redirect('/all')

        }catch(e){
            const error = [
                {
                    msg:'No se ha podido añadir el objeto'
                }
            ]
            const { email } = jwt.decode(req.session.token,process.env.SECRET_TOKEN_CLIENT)
            const data = {
                rol:rol
            }

            res.render('add',{error,data})
        }
    } 
    
})

router.post('/update/:id',[
    body('title','Introduce un titulo').exists().isLength({min:4,max:20}),
    body('description','Introduce una description').exists().isLength({min:5}),
    body('picture','Introduce url de una imagen').exists().isLength({min:5})
],async(req,res)=>{

    const verify = validationResult(req)

    if(!verify.isEmpty()){
        const error = verify.array()

        const {  rol } = jwt.decode(req.session.token,process.env.SECRET_TOKEN_CLIENT)
        const data = {
            rol:rol
        }
    
        res.render('update',{error,data})
    }else{

        const { title,description,picture } = req.body

        try{    

            const user = await findUserByEmail(req.session.email)

            const findObject =  user[0].favoritos.find(el => el.id == req.params.id)


            user[0].favoritos[user[0].favoritos.indexOf(findObject)].title = title
            user[0].favoritos[user[0].favoritos.indexOf(findObject)].description = description
            user[0].favoritos[user[0].favoritos.indexOf(findObject)].picture = picture

            await addFavorites(user)

            res.redirect('/all')


        }catch(e){
            console.log(e);
            const error = [
                {
                    msg:'No se ha podido modificar el objeto'
                }
            ]

            const object = await findObjectById(req.params.id)
            
            const data = {
                object:object,
                rol:'client'
            }
            res.render('update',{error,data})

        }
    } 
    
})




router.post('/reset',[
    body('email','Introduce un email valido').exists().isEmail(),
],async(req,res)=>{

    const verify = validationResult(req)

    if(!verify.isEmpty()){
        const error = verify.array()

        res.render('reset',{error})
    }else{

        const { email } = req.body

        try{

            const user = await findUserByEmail(email)

            if(user.length != 0){
                const token = jwt.sign({email:email},process.env.SECRET_RESET)

                const ruta = 'http:/localhost:4000/resetPassword/'+token

                const data = {
                    ruta:ruta
                }

                res.render('resetPassword',{data})
            }else{
                const error = [
                    {
                        msg:'El email introducido no esta registrado'
                    }
                ]
                res.render('resetPassword',{error})
            }
        }catch(e){
            const error = [
                {
                    msg:'Hubo un problema al buscar el email, por favor intentelo de nuevo.'
                }
            ]
            res.render('resetPassword',{error})
        }

    }
    
})

router.post('updatePassword',[    
    body('email','Introduce un email valido').exists().isEmail(),
    body('password','Introduce una contraseña').exists().isLength({min:5,max:10})
],async(req,res)=>{

    const verify = validationResult(req)

    if(!verify.isEmpty()){
        const error = verify.array()

        res.render('resetFormulario',{error})
    }else{

            try{    

                const {email,password} = req.body

                const user = await findUserByEmail(email)
                const newPassword = await bcrypt.hash(password,8)

                user[0].password = newPassword

                console.log(user);

                await updateUser(user)

                res.redirect('/')
            }catch(e){
                const error = [
                    {
                        msg:'Hubo un problema al actualizar la contraseña, por favor intentelo de nuevo.'
                    }
                ]
                res.render('resetFormulario',{error})
            }
        

        res.render('resetFormulario')
    }
})
module.exports = router