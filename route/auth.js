const express = require('express')
const mongoose = require('mongoose')
var bcrypt = require('bcrypt')
var router = express.Router()
require('../models/user')
const jwt = require('jsonwebtoken');
const User = mongoose.model("User")
const {password} = require('../config/keys')
const crypto = require('crypto')
const {JWT_SECRET} = require('../config/keys')
const requireLogin = require('../middlewares/requireLogin')

var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'weconnectdevelopers@gmail.com',
        pass: password
    }
  });

router.get('/',(req,res)=>{
    res.send('Updated')
})

router.get('/protected',requireLogin,(req,res)=>{
    res.send("hello user")
})

router.post('/exists',(req,res)=>{
    User.findOne({email:req.body.email})
    .then(saveduser =>{
        if(saveduser)
        {
            return res.status(422).json({"error":"user already exists"})  
        }
        else
        {
            return res.json({"message":"user doesnt't exists"})  

        }
    })
        .catch((err)=>{
            return res.status(422).json({"error":err})
        })
})
router.post('/signup',(req,res)=>{
    const {email,password,name,url} = req.body;
    if(!email || !name || !password)
    {
        return res.status(422).json({"error":"Please add all the fields"})
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
                // text: 'Succesfully Signed in to We connect',
                text: 'Your Account has been created Successfully'
              };
              
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                   
                } else {
                  
                }
              });
            return res.json({"meassge":"Account Created successfully"})
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
        return res.status(422).json({"message":"Invalid Email or password"})
    }

    User.findOne({email})
    .then(saveduser =>{
        if(!saveduser)
        {
            return res.status(422).json({"error":"Invalid Email or password"})
        }

        bcrypt.compare(password,saveduser.password)
        .then(match=>{
            if(match)
            {
                const token = jwt.sign({_id:saveduser._id},JWT_SECRET)
                const {_id,name,email,followers,following,pic} = saveduser
                return res.json({token,user:{_id,name,email,followers,following,pic}})
               
            }
           
            return res.status(422).json({"error":"Invalid Email or password"})
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

// router.put('/reset',(req,res)=>{
//     User.findOne({email:req.body.email})
//     .then(saveduser =>{
//         if(!saveduser)
//         {
//             return res.status(422).json({"error":"Invalid Email"}) 
//         }
//         else
//         {
//             var randompass = Math.random().toString(36).slice(-10);
             
//         bcrypt.hash(randompass,12)
//         .then(hashedpassword =>{
//             User.updateOne({email:req.body.email},{$set:{
//                 password:hashedpassword
//             }})
//             .then(pass=>{
//                 var mailOptions = {
//                     from: 'weconnectdevelopers@gmail.com',
//                     to: req.body.email,
//                     subject: 'Reset Password',
//                     text: `We Recommend Once You Sign in Change your password use below Password to Sign in\n${randompass}`
//                   };
                  
//                   transporter.sendMail(mailOptions, function(error, info){
//                     if (error) {
//                         return res.status(422).json({"error":"Something went wrong"})
//                     } else {
//                       res.json({"message":"Updated Succesfully"})
//                     }
//                   });
//             })
//             .catch(err => console.log(err))
//         })
//         .catch(err=>console.log(err))

//         }
//     })
    
// })


router.put('/reset',(req,res)=>{
    User.findOne({email:req.body.email})
    .then(user =>{

        if(!user)
        {
            return res.status(422).json({"error":"Invalid Email"}) 
        }
        else
        {
            crypto.randomBytes(32,(err,buffer)=>{
                if(err){
                    console.log(err)
                }
                const token = buffer.toString("hex")
                user.resetToken = token
                user.expireToken = Date.now() + 3600000
                user.save().then((result)=>{
                    var mailOptions = {
                        from: 'weconnectdevelopers@gmail.com',
                        to: req.body.email,
                        subject: 'Reset Password',
                        text: `Reset Password Link\nhttps://weconnect-frontend.herokuapp.com/newpass/${token}`
                      };
                      
                      transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                            return res.status(422).json({"error":"Something went wrong"})
                        } else {
                          res.json({"message":"check your mail"})
                        }
                      });
                })
               
            })
    
        }
    })
})

router.post('/new-password',(req,res)=>{
    console.log('called')
    const newPassword = req.body.password
    const sentToken = req.body.token
    User.findOne({resetToken:sentToken,expireToken:{$gt:Date.now()}})
    .then(user=>{
        if(!user){
            return res.status(422).json({error:"Try again session expired"})
        }
        bcrypt.hash(newPassword,12).then(hashedpassword=>{
           user.password = hashedpassword
           user.resetToken = undefined
           user.expireToken = undefined
           user.save().then((saveduser)=>{
               res.json({message:"password updated successfully"})
           })
        })
    }).catch(err=>{
        console.log(err)
    })
})


module.exports = router;

