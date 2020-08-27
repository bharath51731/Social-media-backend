const express = require('express')
const mongoose = require('mongoose')
var router = express.Router()
require('../models/user')
const jwt = require('jsonwebtoken');
const User = mongoose.model("User")
const Post = mongoose.model("Post")
var bcrypt = require('bcrypt')
const requireLogin = require('../middlewares/requireLogin')


router.get('/user/:id',(req,res)=>{
    User.findOne({_id:req.params.id})
    // .populate("followers","_id name")
    // .populate("following","_id name")
    .select("-password")
    .then(user=>{
        Post.find({postedBy:req.params.id})
        .populate("postedBy","_id name")
        .exec((err,posts)=>{
            if(err)
            return res.status(422).json({"error":err})
            
            
                res.json({user,posts})
          
           
            
        })
    })
    .catch(err=>{
        return res.status(404).json({"error":"User not found"})
    })

})

router.put('/follow',requireLogin,(req,res)=>{
    User.findByIdAndUpdate(req.body.followid,{
     $addToSet:{followers:req.user._id}
    },
    {
        new:true
    },
    (err,result) =>{
        if(err)
        return res.status(422).json({"error":err})

        User.findByIdAndUpdate(req.user._id,{
            $addToSet:{following:req.body.followid}
        },{
            new:true
        })
        .select("-password")
        .then(result=>{
            res.json(result)
        }).catch(err=>{
            res.status(422).json({"error":err})

        })
})
})



router.put('/unfollow',requireLogin,(req,res)=>{
    User.findByIdAndUpdate(req.body.followid,{
     $pull:{followers:req.user._id}
    },
    {
        new:true
    },
    (err,result) =>{
        if(err)
        return res.status(422).json({"error":err})

        User.findByIdAndUpdate(req.user._id,{
            $pull:{following:req.body.followid}
        },{
            new:true
        })
        .select("-password")
        .then(result=>{
            res.json(result)
        }).catch(err=>{
            res.status(422).json({"error":err})

        })
})
})
router.put('/changename',requireLogin,(req,res)=>{
    User.updateOne({_id:req.user._id},{$set:{name:req.body.name}},{
        new:true
    })
    .then(result=>{
        res.json({result})
    })
    .catch(err=>console.log(err))
})

router.put('/changepic',requireLogin,(req,res)=>{
    User.updateOne({_id:req.user._id},{$set:{pic:req.body.pic}},{
        new:true
    })
    .then(result=>{
        res.json({result})
    })
    .catch(err=>console.log(err))
})
router.put('/delpic',requireLogin,(req,res)=>{
    User.updateOne({_id:req.user._id},{$set:{pic:"https://res.cloudinary.com/dnvgajic2/image/upload/v1598419807/default_user_brfslf.png"}},{
        new:true
    })
    .then(result=>{
        res.json({result})
    })
    .catch(err=>console.log(err))
})

router.post('/search-users',(req,res)=>{
    let userPattern = new RegExp("^"+req.body.query,"i")
    User.find({$or:[{name:{$regex:userPattern}},{email:{$regex:userPattern}}]})
    .select("_id name pic")
    .then(user=>{
        res.json({user})
    }).catch(err=>{
        console.log(err)
    })

})

router.delete('/delacc',requireLogin,(req,res)=>{
    const {pass} = req.body;
    // console.log(pass,req.user._id)
    if(!pass)
    {
        return res.status(422).json({"error":"please fill all fields"})
    }

   

    User.findOne({_id:req.user._id})
    .then(saveduser =>{
        if(!saveduser)
        {
            return res.status(422).json({"error":"Invalid Email or password"})
        }

        bcrypt.compare(pass,saveduser.password)
        .then((match)=>{
            
            if(match)
            {
                //  console.log(req.user._id)
                User.findOne({_id:req.user._id})
                

                .then(async result=>{
                    // User.updateMany({_id:{$in:result.followers}},{$pull:{following:req.user._id}})
                    // .then(r=>{
                    //     User.updateMany({_id:{$in:result.following}},{$pull:{followers:req.user._id}}).then(r=>{

                    //     })
                    // })
                    await User.updateMany({_id:{$in:result.followers}},{$pull:{following:req.user._id}})
                    await User.updateMany({_id:{$in:result.following}},{$pull:{followers:req.user._id}})

                    await Post.updateMany({},{$pull:{comments:{postedBy:req.user._id}}})
                    await Post.updateMany({},{$pull:{likes:req.user._id}})
                    // await Post.updateMany({postedBy:{$in:result.following}},{$pull:{comments:req.user._id}})
                    
                    // console.log(result.followers)
                    // console.log(result.following)
                })
                
                
               
                
               Post.deleteMany({postedBy:req.user._id})
               .then(result=>{
                   User.deleteOne({_id:req.user._id})
                   .then(result=>res.json({"message":"Succefully deleted"}))
               })
          
            
            }
            else
            {
                res.json({"error":"Wrong Password"})
            }
           
        }).catch(err=>console.log(err))
    }).catch(err=>console.log(err))


})
router.get('/followers',requireLogin,(req,res)=>{
         User.find({_id:req.user._id})
         .populate("followers", "_id name pic")
         .then(result=>{
             res.json({followers:result})
         })
         .catch(err=>console.log(err))
})
module.exports = router