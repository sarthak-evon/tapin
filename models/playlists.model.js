const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema.Types
const playlistSchema = new mongoose.Schema({
    playlistName:{
        type:String,
        // required:true
    },
    songs:[
        String
    ],
    photo:[
        String
    ],
    createdBy:{
       type:ObjectId,
       ref:"User"
    }
},{timestamps:true})

mongoose.model("Playlist",playlistSchema)