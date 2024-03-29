const express = require('express')
const mongoose = require('mongoose')
require('../models/post')
var router = express.Router()
const requireLogin = require('../middlewares/requireLogin')
const User = mongoose.model("User")
const Post = mongoose.model('Post')

router.post('/createpost',requireLogin,(req,res)=>{
    const {body,url} = req.body

    if( !body && !url)
    {
        return res.status(422).json({"error":"please fill atleast one feilds"})
    }

    if(body.length>1000)
    return res.status(422).json({"error":"Character limit exceeded"})

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); 
    var yyyy = today.getFullYear();

    today = dd + '/' + mm + '/' + yyyy;
    req.user.password = undefined
    const post = new Post({
        body,
        postedBy:req.user,
        photo:url,
        createdOn:today
        
    })

    post.save()
    .then(result =>{
     res.json({post:result})
    })
    .catch(err => console.log(err))
})

router.get('/allpost',requireLogin,(req,res)=>{
   Post.find()
      .populate('postedBy','_id name pic')
    //  .populate("comments.postedBy","_id name")
     .sort("-createdAt")
   .then(posts =>{
       return res.json({posts})
   })
   .catch(err => console.log(err))
})

router.post('/myallpost',requireLogin,(req,res)=>{
   
   
   Post.find({postedBy:req.body.id})
      .populate('postedBy','_id name pic')
    //  .populate("comments.postedBy","_id name")
     .sort("-createdAt")
   .then(posts =>{
       return res.json({posts})
   })
   .catch(err => console.log(err))
})

router.get('/followingpost',requireLogin,(req,res)=>{
    
   Post.find({postedBy:{$in:req.user.following}})
      .populate('postedBy','_id name pic')
    //  .populate("comments.postedBy","_id name pic")
     .sort("-createdAt")
   .then(posts =>{
       return res.json({posts})
   })
   .catch(err => console.log(err))
})

router.get('/mypost',requireLogin,(req,res)=>{
    
    Post.find({postedBy:req.user._id})
    .populate("postedBy","_id name pic")
    .sort("-createdAt")
    .then(myPost =>{
    User.findOne({_id:req.user._id})
         .populate("followers","_id name pic")
         .populate("following","_id name pic")
        .then(user=>{
            res.send({user:user,mypost:myPost})
        })
        .catch(err=>console.log(err))
    })
    .catch(err => console.log(err))
})



router.put('/like',requireLogin,(req,res)=>{
    Post.findByIdAndUpdate(req.body.postId,{
        $addToSet:{likes:req.user._id}
    },{
        new:true
    })
    .populate("comments.postedBy","_id name")
    .populate('postedBy','_id name pic')
    .exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            res.json(result)
        }
    })
})
router.put('/unlike',requireLogin,(req,res)=>{
    Post.findByIdAndUpdate(req.body.postId,{
        $pull:{likes:req.user._id}
    },{
        new:true
    })
    .populate("comments.postedBy","_id name")
    .populate('postedBy','_id name pic')
    .exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            res.json(result)
        }
    })
})

router.put('/comment',requireLogin,(req,res)=>{
    const comment = {
        text:req.body.text,
        postedBy:req.user._id
    }
   
    Post.findByIdAndUpdate(req.body.postId,{
        $push:{comments:comment}
    },{
        new:true
    })
     .populate("comments.postedBy","_id name pic")
    .populate("postedBy","_id name pic")
    .exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            res.json(result)
        }
    })
})



router.delete('/deletepost/:postId',requireLogin,(req,res)=>{
    Post.findOne({_id:req.params.postId})
    .populate("comments.postedBy","_id name")
    .populate("postedBy","_id pic")
    .exec((err,post)=>{
        if(err || !post){
            return res.status(422).json({error:err})
        }
        if(post.postedBy._id.toString() === req.user._id.toString()){
              post.remove()
              .then(result=>{
                  res.json(result)
              }).catch(err=>{
                  console.log(err)
              })
        }
    })
})
router.delete('/deleteAllPost',requireLogin,(req,res)=>{
   Post.deleteMany({postedBy:req.user._id})
   .then(()=>{
       res.json({"message":"Deleted"})
   })
   .catch(err=>{
       res.status(422).json({"error":"Something Went Wrong"})
   })
})



router.delete('/deletecomment',requireLogin,(req,res)=>{

     
    const {pid,cid} = req.body
    
   
   Post.findOneAndUpdate({_id:pid},{
       $pull:{comments:{_id:cid}}
   },{
    new:true
})
   .populate("comments.postedBy","_id name pic")
   .populate("postedBy","_id name pic")
   .then((result)=>{
       if(result)
       {
      
        return res.json(result)
        
       }
      
    }).catch(err => console.log(err))
})

router.post('/viewpost',requireLogin,(req,res)=>{
   
    Post.find({_id:req.body.id})
       .populate('postedBy','_id name pic')
       .populate("comments.postedBy","_id name pic")
        
    .then(posts =>{
        return res.json({posts})
    })
    .catch(err => console.log(err))
 })



module.exports = router;

