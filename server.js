require('./models/db');
require('./config/passportConfig');

const express = require('express');
const cors = require('cors');
const passport = require('passport');

const rtsIndex = require('./routes/index.router');

var app = express();


app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.use(cors());
app.use(passport.initialize());
app.use('/', rtsIndex);


app.get('/', (req, res) => {
    res.send('Welcome to the api');
    console.log("Welcome to Api")
  });
 
// app.use((err, req, res, next) => {
//     if (err.name === 'ValidationError') {
//         var valErrors = [];
//         Object.keys(err.errors).forEach(key => valErrors.push(err.errors[key].message));
//         res.status(422).send(valErrors)
//     }
    
// });
const PORT=process.env.PORT || 3000
app.listen(PORT, () => console.log("Server started at port : ",PORT));























;














