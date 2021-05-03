require('dotenv').config();

const mongoose = require('mongoose');
var User = mongoose.model('User');
const Post = mongoose.model('Post');

module.exports.allpost=(req,res)=>{ //all post api
    Post.find()
    .populate("postedBy","_id name")
    .populate("comments.postedBy","_id name")
    .sort('-createdAt')
    .then((posts)=>{
        res.json({posts})
    }).catch(err=>{
        console.log(err)
    })
    
}

module.exports.mypost= (req,res)=>{  //logged in users's post
    Post.find({postedBy:req.user._id})
    .populate("PostedBy","_id firstName lastName")
    .then(mypost=>{
        res.json({mypost})
    })
    .catch(err=>{
        console.log(err)
    })
}


module.exports.getsubpost=(req,res)=>{ //get post from following

    // if postedBy in following
    Post.find({postedBy:{$in:req.user.following}})
    .populate("postedBy","_id firstName lastName")
    .populate("comments.postedBy","_id firstName lastName")
    .sort('-createdAt')
    .then(posts=>{
        res.json({"posts":posts,"length":posts.length})
		console.log(posts.length)
    })
    .catch(err=>{
        console.log(err)
    })
}


module.exports.createpost=(req,res)=>{ //creating new post   and working on this api
    const {title,songs,pic} = req.body 
    console.log(req.body,"hello")
    if(!title || !songs || !pic){
      res.status(422).json({error:"Plase add all the fields"})
      console.log(error)
    }
    // req.user.password = undefined
    const post = new Post({
        title,
        songs,
        photos:pic,
        postedBy:req.user
    })
    post.save().then(result=>{
        res.json({post:result})
    })
    .catch(err=>{
        console.log(err)
    })
}


module.exports.like=(req,res)=>{ //liking a post
    
    Post.findByIdAndUpdate(req.body.postId,{
        $push:{likes:req.user._id}
    },{
        new:true
    }).exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            res.json(result)
        }
    })
}

module.exports.unlike=(req,res)=>{ //unlike a post
    Post.findByIdAndUpdate(req.body.postId,{
        $pull:{likes:req.user._id}
    },{
        new:true
    }).exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            res.json(result)
        }
    })
}


module.exports.follow = (req, res,callback) => { //following a user

    const following=req.user.following;
    const found =  (following.find(num=>num==req.body.followId))
  
 if(found==undefined){
	User.findByIdAndUpdate(
       
		req.body.followId,
		{
			$push: { followers: req.user._id },
		},
		{
			new: true,
		},
		(err, result) => {
			if (err) {
				res.status(422).json({ error: err });
				console.log(err)
			}
			User.findByIdAndUpdate(
				req.user._id,
				{
					$push: { following: req.body.followId },
				},
				{ new: true }
			)
				.select("-password")
				.then((result) => {
					res.json({message:"followed",status:"true"});
				})
				.catch((err) => {
					 res.status(422).json({ error: err });
					console.log(err)
				});
		}
	);
 }
 else{
     res.send({"error":"Already following",status:"false"})
     console.log("Alredy following")
 }
      
};

module.exports.unfollow = (req, res) => { //unfollowing a user
	User.findByIdAndUpdate(
		req.body.unfollowId,
		{
			$pull: { followers: req.user._id },
		},
		{
			new: true,
		},
		(err, result) => {
			if (err) { 
				return res.status(422).json({ error: err });
			}
			User.findByIdAndUpdate(
				req.user._id,
				{
					$pull: { following: req.body.unfollowId },
				},
				{ new: true }
			)
				.select("-password")
				.then((result) => {
					res.json({message:"unfollowed",status:"true"});
				})
				.catch((err) => {
					return res.status(422).json({ error: err });
				});
		}
	);
};

