require('dotenv').config()
const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_AUTH_TOKEN = process.env.JWT_AUTH_TOKEN;

const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
       
    },
    lastName:{
        type:String,
        
    },
    fullName:{
        type:String,
       
    },
    email:{
        type:String,
       
    },
    userName:{
        type:String,
        
    },
    password:{
        type:String,
        // required:true
    },
    phone_number:{
        type:String,
        required:true,
    
    },
    profilePicture:{
        tye:String
    },
    id:{
        type:Number
    },
    saltSecret: String,
    // resetToken:String,
    // expireToken:Date,
        
    followers:[{type:ObjectId,ref:"User"}],
    following:[{type:ObjectId,ref:"User"}]
})


//email checking method
userSchema.path('email').validate((val) => {
    emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(val);
}, 'Invalid e-mail.');

//password decryption method
userSchema.methods.verifyPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};


//jwt generation function
userSchema.methods.generateJwt = function () {
    return jwt.sign({_id:this._id,phone: this.phone_number},
        JWT_AUTH_TOKEN,
    {
        expiresIn: "30d"
    });
}



mongoose.model('User', userSchema);                                                                                                                         