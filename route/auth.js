const express = require('express')
const mongoose = require('mongoose')
var bcrypt = require('bcrypt')
var router = express.Router()
// const nodemailer = require('nodemailer')
// const sendgridTransport = require('nodemailer-sendgrid-transport')
require('../models/user')
const jwt = require('jsonwebtoken');
const User = mongoose.model("User")

const {JWT_SECRET} = require('../config/keys')
const requireLogin = require('../middlewares/requireLogin')


// const transporter = nodemailer.createTransport(sendgridTransport({
//     auth:{
//         api_key:'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'
//     }
// }))

// const sgMail = require('@sendgrid/mail')
// sgMail.setApiKey('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')
// const msg={
//     to : "bharathkumar51731@gmail.com",
//     from : "bharathshettigar925@gmail.com",
//     subject : "Fun",
//     text : "super"
// }
// sgMail.send(msg)
router.get('/',(req,res)=>{
    res.send('route')
})

router.get('/protected',requireLogin,(req,res)=>{
    res.send("hello user")
})
router.post('/signup',(req,res)=>{
    const {email,password,name,url} = req.body;
    if(!email || !name || !password)
    {
        return res.status(422).json({"error":"please add all the fields"})
    }
   
    User.findOne({email:email})
    .then(saveduser =>{
        if(saveduser)
        {
            return res.status(422).json({"error":"user already exists"})  
        }
        
        bcrypt.hash(password,12)
        .then(hashedpassword =>{
        const users = new User({

            name,
            email,
            password:hashedpassword,
            pic:url
            
        })

        users.save()
        .then(user => {
            // transporter.sendMail({
            //         to:email,
            //         from:"bharathshettigar925@gmail.com",
            //         subject:"signup success",
            //         html:"<h1>welcome to instagram</h1>"
            //     })
            return res.json({"meassge":"saved succesfully"})
        })
        .catch(err => console.log(err))
    })
    })
    .catch(err => console.log(err))
    
})

router.post('/signin',(req,res)=>{
    const {email,password} = req.body;

    if(!email || !password)
    {
        return res.status(422).json({"message":"Invalid username or password"})
    }

    User.findOne({email})
    .then(saveduser =>{
        if(!saveduser)
        {
            return res.status(422).json({"error":"Invalid username or password"})
        }

        bcrypt.compare(password,saveduser.password)
        .then(match=>{
            if(match)
            {
                const token = jwt.sign({_id:saveduser._id},JWT_SECRET)
                const {_id,name,email,followers,following,pic} = saveduser
                return res.json({token,user:{_id,name,email,followers,following,pic}})
               
            }
           
            return res.status(422).json({"error":"Invalid username or password"})
        })
    })
})

router.put('/changepass',requireLogin,(req,res)=>{
    const {oldpass,newpass} = req.body;
   
    if(!oldpass || !newpass)
    {
        return res.status(422).json({"message":"please fill all fields"})
    }

    User.findOne({_id:req.user._id})
    .then(saveduser =>{
       
        if(!saveduser)
        {
            return res.status(422).json({"error":"Invalid username or password"})
        }

        bcrypt.compare(oldpass,saveduser.password)
        .then(match=>{
            
            if(match)
            {
                bcrypt.hash(newpass,12)
               .then(hashedpassword =>{
               User.updateOne({_id:req.user._id},{$set:{
                   
                   password:hashedpassword
                }})
                .then(result=>{
                    return res.json({"message":"Succesfully updated"})
                })
            })
               
            }
            else
            return res.status(422).json({"error":"credentials invalid"})
        }).catch(err=>console.log(err))
    }).catch(err=>console.log(err))
})




module.exports = router;