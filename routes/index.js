const express = require('express')

const bcrypt = require('bcryptjs')

const jwt =  require('jsonwebtoken')

const {body,validationResult} = require('express-validator')

const { createUser, findUserByEmail}  = require('../services/userService')

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
                if(bcrypt.compare(password,user[0].password)){

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

module.exports = router