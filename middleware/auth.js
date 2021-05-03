require('dotenv').config()

//jwt verification function
const jwt = require('jsonwebtoken');
const JWT_AUTH_TOKEN = process.env.JWT_AUTH_TOKEN;
const mongoose = require('mongoose')
const User = mongoose.model("User")
module.exports.verifyJwtToken = (req, res, next) => {
    var token;
    if ('authorization' in req.headers)
        token = req.headers['authorization'].split(' ')[1];

    if (!token)
        return res.status(403).send({ auth: false, message: 'No token provided.' });
    else {
        jwt.verify(token, JWT_AUTH_TOKEN,
            (err, decoded) => {
                if (err){
                    res.status(500).send({ auth: false, message: 'Token authentication failed.' });
                    console.log(err)
            }
                else {
                    const {_id} = decoded
                    User.findById(_id).then(userdata=>{
                    req.user = userdata
                    next()
})
                }
            }
        )
    }
}





