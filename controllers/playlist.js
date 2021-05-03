require('dotenv').config();

const mongoose = require('mongoose');
var User = mongoose.model('User');
const Post = mongoose.model('Post');
const Playlist = mongoose.model('Playlist')