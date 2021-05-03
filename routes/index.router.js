const express = require('express');
const router = express.Router();
var path = require('path');
//routes for api

const ctrlUser = require('../controllers/user.controller');
const ctrlPost = require('../controllers/post.controller');

const jwtHelper = require('../middleware/auth');


router.post('/login', ctrlUser.loginwithOtp);   
router.post('/verifyOTP', ctrlUser.verifyOtp);     
router.post('/emailLogin', ctrlUser.authenticate);
router.post('/completeProfile', jwtHelper.verifyJwtToken,ctrlUser.updateProfile)
router.post('/username', ctrlUser.userName)
router.post('/resetPassword', ctrlUser.resetPassword)
router.post('/forgotPasswordOTP', ctrlUser.forgotPasswordOTP)
router.post('/forgotPasswordVerify', ctrlUser.forgotPasswordVerify)
router.post('/image', jwtHelper.verifyJwtToken,ctrlUser.upload);
router.get('/userProfile', jwtHelper.verifyJwtToken,ctrlUser.userProfile);
router.get('/suggestedUser', jwtHelper.verifyJwtToken,ctrlUser.suggestedUser);
router.put('/follow', jwtHelper.verifyJwtToken,ctrlPost.follow);
router.put('/unfollow', jwtHelper.verifyJwtToken,ctrlPost.unfollow);
router.put('/like', jwtHelper.verifyJwtToken,ctrlPost.like);
router.put('/unlike', jwtHelper.verifyJwtToken,ctrlPost.unlike);
router.post('/createPost', jwtHelper.verifyJwtToken,ctrlPost.createpost,ctrlUser.upload);
router.get('/getSubPost', jwtHelper.verifyJwtToken,ctrlPost.getsubpost);


module.exports = router;




