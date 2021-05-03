const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema.Types
const postSchema = new mongoose.Schema({
    title:{
        type:String,
        // required:true
    },
    songs:[
        String
    ],
    photos:[
        String
    ],
    likes:[{type:ObjectId,ref:"User"}],
   
    postedBy:{
       type:ObjectId,
       ref:"User"
    }
},{timestamps:true})

mongoose.model("Post",postSchema)