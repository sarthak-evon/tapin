const mongoose =require('mongoose')

var tokenSchema =  new mongoose.Schema({
    tokenID:{
        type:Number
    },
    userid:{
       type:Number
    },
    apple:{
        type:Number
    },
    spotify:{
        type:Number
    },
    tidal:{
        type:Number
    },
    soundCloud:{
        type:Number
    }
}) 