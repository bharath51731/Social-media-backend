const express = require('express')
const mongoose = require('mongoose')
var bcrypt = require('bcrypt')
var router = express.Router()
require('../models/user')
const jwt = require('jsonwebtoken');
const User = mongoose.model("User")

const {JWT_SECRET} = require('../config/keys')
const requireLogin = require('../middlewares/requireLogin')

var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'weconnectdevelopers@gmail.com',
        pass: '963214@6'
    }
  });



router.get('/',(req,res)=>{
    res.send('Updated1')
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
            var mailOptions = {
                from: 'weconnectdevelopers@gmail.com',
                to: email,
                subject: 'Welcome',
                text: 'Succesfully Signed in to We connect'
              };
              
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                   
                } else {
                  
                }
              });
            return res.json({"meassge":"Account Created succesfully"})
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
            return res.status(422).json({"error":"Wrong Password"})
        }).catch(err=>console.log(err))
    }).catch(err=>console.log(err))
})

router.put('/reset',(req,res)=>{
    User.findOne({email:req.body.email})
    .then(saveduser =>{
        if(!saveduser)
        {
            return res.status(422).json({"error":"Invalid Email"}) 
        }
        else
        {
            var randompass = Math.random().toString(36).slice(-10);
            // console.log(randompass)
             
        bcrypt.hash(randompass,12)
        .then(hashedpassword =>{
            User.updateOne({email:req.body.email},{$set:{
                password:hashedpassword
            }})
            .then(pass=>{
                var mailOptions = {
                    from: 'weconnectdevelopers@gmail.com',
                    to: req.body.email,
                    subject: 'Reset Password',
                    text: `We Recommend Once You Sign in Change your password use below Password to Sign in\n${randompass}`
                  };
                  
                  transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                        return res.status(422).json({"error":"Something went wrong"})
                    } else {
                      res.json({"message":"Updated Succesfully"})
                    }
                  });
            })
            .catch(err => console.log(err))
        })
        .catch(err=>console.log(err))

        }
    })
    
})



module.exports = router;