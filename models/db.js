
//live mongo ulr
// const url ="mongodb+srv://sarthak123:sarthak@cluster0-jciqv.mongodb.net/test?retryWrites=true&w=majority"

//local mongo url
const url ="mongodb://localhost:27017/tapin"
const mongoose = require('mongoose');

mongoose.connect(url, {useNewUrlParser: true,useCreateIndex: true,useUnifiedTopology: true },(err) => {
    if (!err) { console.log('MongoDB connection succeeded.'); }
    else { console.log('Error in MongoDB connection : ' + err); }
    
});

require('./users.model');
require('./tokens.model');
require('./posts.model');


