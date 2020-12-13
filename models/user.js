const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema.Types
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        minlength:2,
        maxlength:20,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        minlength:5,
        required:true
    },
    pic:{
        type:String,
        default:"https://res.cloudinary.com/dnvgajic2/image/upload/v1598419807/default_user_brfslf.png"
       },
    followers:[{type:ObjectId,ref:"User"}],
    following:[{type:ObjectId,ref:"User"}],
    resetToken:String,
    expireToken:Date
})

mongoose.model("User",userSchema)