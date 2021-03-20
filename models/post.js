const mongoose = require('mongoose')
const {ObjectId} =mongoose.Schema.Types
const postSchema = new mongoose.Schema({
   
    body:{
        type:String,
        maxlength:1000,
        
        
    },
    createdOn:{
        type:String
    },
    photo:{
        type:String,
        default:"no image"
    },
    postedBy:{
        type:ObjectId,
        ref:"User"
    },
    likes:[{type:ObjectId,ref:"User"}],
    comments:[{
        text:String,
        postedBy:{type:ObjectId,ref:"User"}
    }],
    postedBy:{
       type:ObjectId,
       ref:"User"
    }
},{timestamps:true})

mongoose.model('Post',postSchema)