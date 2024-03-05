const express = require('express')

const app = express()

const dotenv = require('dotenv')

const { db } = require('./db') 

const cookieParser = require('cookie-parser')

const session = require('express-session')

const ejs = require('ejs')

const morgan = require('morgan')

app.use(morgan('dev'))
app.set('view engine','ejs')
app.use(express.urlencoded({extended:false}))
app.use(express.json())
dotenv.config({path:'.env'})


app.use('/public',express.static(__dirname+'/public'))

app.use(session({
    secret:'secret',
    saveUninitialized:true,
    resave: true
}))


//routes

app.use('/',require('./routes/index'))

// app.use('/objetos',require('./routes/products'))
// app.use('/usuarios',require('./routes/usuarios'))

const port = process.env.PORT || 3000
app.listen( port)
console.log(`server running on port ${port}`)