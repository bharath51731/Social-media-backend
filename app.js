const express = require('express')
const {URI} = require('./config/keys');
var mongoose = require('mongoose')
var router = require('./route/auth');
const app = express()
const cors = require('cors')
require('dotenv').config()
app.use(cors())

app.use(express.json())
app.use(require('./route/auth'))
app.use(require('./route/post'))
app.use(require('./route/user'))

app.get('/',(req,res)=>{
    res.send('hi')
})


mongoose.set('useFindAndModify', false);
mongoose.connect(URI, { useNewUrlParser: true , useUnifiedTopology: true ,useFindAndModify: false})
mongoose.connection.on('connected',()=>{
    console.log('connected')
})
require('./models/user')
require('./models/post')


app.listen(process.env.PORT || 8000);