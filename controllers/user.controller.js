require('dotenv').config();

const mongoose = require('mongoose');
var User = mongoose.model('User');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/config')
const crypto = require('crypto');
const multer = require('multer');
var fs = require('fs');
const path = require("path");
const base64_decode =  require('../helper/image64decode')
const SMS_KEY = process.env.SMS_KEY
const JWT_AUTH_TOKEN = process.env.JWT_AUTH_TOKEN;
// const accountSID= process.env.ACCOUNT_SID;
// const authToken= process.env.AUTH_TOKEN;
const client = require('twilio')(config.accountSID, config.authToken)


// login with mobile number
module.exports.loginwithOtp = (req, res) => {
	const phone = req.body.phone;
	const otp = Math.floor(100000 + Math.random() * 900000);
	const ttl = 2 * 60 * 1000;
	const expires = Date.now() + ttl;
	const data = `${phone}.${otp}.${expires}`;
	const hash = crypto.createHmac('sha256', SMS_KEY).update(data).digest('hex');
	const fullHash = `${hash}.${expires}`;

	client.messages
		.create({
			body: `${otp} is your OTP for TAPIN`,
			from: +17637103160
			,
			to: phone
		})
		.then((messages) => console.log(messages))
		.catch((err) => console.error(err));

	res.status(200).send({ phone, hash: fullHash, otp });
	// res.status(200).send({message:'true', phone, hash: fullHash ,});          

}

//otp verifing api
module.exports.verifyOtp = (req, res) => {
	const phone = req.body.phone;
	const hash = req.body.hash;
	const otp = req.body.otp;
	console.log(req.body)
	let [hashValue, expires] = hash.split('.');

	let now = Date.now();
	if (now > parseInt(expires)) {
		return res.status(504).send({ msg: 'Timeout. Please try again' });
	}
	let data = `${phone}.${otp}.${expires}`;
	let newCalculatedHash = crypto.createHmac('sha256', SMS_KEY).update(data).digest('hex');
	if (newCalculatedHash === hashValue) {
		console.log('user confirmed');


		User.findOne({ phone_number: req.body.phone }, (err, user) => {

			if (user) {

				res.send({ message: "true", status: "Account Exist", "token": user.generateJwt() })
			}
			else if (!user) {
				var user = new User();
				user.id = Date.now()
				user.phone_number = req.body.phone;
				user.save((err, doc) => {
					if (err) {
						res.send({ err });
					}
					else {
						const accessToken = jwt.sign({ data: phone, _id: user._id }, JWT_AUTH_TOKEN, { expiresIn: '30d' });
						res.send({ message: "true", status: "New User", "token": accessToken })
					}
				});
			}
			else {
				res.send(err)
			}
		})

	} else {
		console.log('not authenticated');
		return res.status(400).send({ message: "false", status: 'Incorrect OTP' });
	}

}

//login with email
module.exports.authenticate = (req, res, next) => {

	passport.authenticate('local', (err, user, info) => {

		if (err) return res.status(400).json(err);

		else if (user) {

			return res.status(200).json({ message: "true", token: user.generateJwt() });
		}
		else return res.status(404).json(info);
	})
}

//complete user's profile after otp verification
module.exports.updateProfile = (req, res) => {

	if (req.user._id) {
		console.log("user", req.user._id)

		User.findOne({ _id: req.user._id }, (err, userInfo) => {
			if (err) {
				res.send(err)
			}
			else {
				console.log(userInfo)
				User.findOne({ email: req.body.email }, (err, emailInfo) => {
					if (emailInfo) {
						res.send({ message: "false", status: "Email alredy exist" })
					}
					else {
						bcrypt.genSalt(10, (err, salt) => {
							bcrypt.hash(req.body.password, salt, (err, hash) => {
								req.body.password = hash;

								userInfo.updateOne({
									"firstName": req.body.firstName,
									"lastName": req.body.lastName,
									"email": req.body.email,
									"userName": req.body.userName,
									"password": req.body.password

								}, (err, UserInstance) => {


									if (err) {
										res.send(err)
									}
									else {
										res.send({ message: "true", status: "You have successfully completed you profile" })
									}
								})
							});
						});
					}
				})

			}
		})
	}
	else {
		console.log("not authenticated")
		res.send({ message: "false", status: "User not logged in" })
	}
}

//forgot password otp api
module.exports.forgotPasswordOTP = (req, res) => {

	User.findOne({ phone_number: req.body.phone }, (err, accountINfo) => {
		if (accountINfo) {
			console.log("Account Exist ")

			const phone = req.body.phone;
			const otp = Math.floor(100000 + Math.random() * 900000);
			const ttl = 2 * 60 * 1000;
			const expires = Date.now() + ttl;
			const data = `${phone}.${otp}.${expires}`;
			const hash = crypto.createHmac('sha256', SMS_KEY).update(data).digest('hex');
			const fullHash = `${hash}.${expires}`;

			client.messages
				.create({
					body: `Your OTP for Password reset  is ${otp}`,
					from: +17637103160,
					to: phone
				})
				.then((messages) => console.log(messages))
				.catch((err) => console.error(err));

			res.status(200).send({ message: 'true', phone, hash: fullHash });

		}
		else {
			res.send({ message: "false", status: "NO account Exist Please Signup with phone numbe r" })
		}
	})
}

//otp verification for forgot password api
module.exports.forgotPasswordVerify = (req, res) => {
	const phone = req.body.phone;
	const hash = req.body.hash;
	const otp = req.body.otp;
	let [hashValue, expires] = hash.split('.');

	let now = Date.now();
	if (now > parseInt(expires)) {
		return res.status(504).send({ message: "false", status: 'Timeout. Please try again' });
	}
	let data = `${phone}.${otp}.${expires}`;
	let newCalculatedHash = crypto.createHmac('sha256', SMS_KEY).update(data).digest('hex');

	if (newCalculatedHash === hashValue) {
		console.log('OTP verified');
		res.send({ phone: req.body.phone, message: "true", status: "OTP verified" })

	} else {
		console.log('not authenticated');
		return res.status(400).send({ message: "false", status: 'Incorrect OTP' });
	}

}


//reset password  api
module.exports.resetPassword = (req, res) => {
	if (req.body.password == req.body.confirmPassword) {
		User.findOne({ phone_number: req.body.phone }, (err, userInfo) => {
			if (err) {
				gty
				res.send({ message: err })
			}
			else {
				bcrypt.genSalt(10, (err, salt) => {
					bcrypt.hash(req.body.password, salt, (err, hash) => {
						req.body.password = hash;
						userInfo.updateOne({
							password: req.body.password
						}, (err, password) => {
							if (err) {
								res.send(err)
							}
							else {
								res.send({ message: "true", status: "Password changed Please login again" })
							}
						})
					})
				})
			} 
		})
	} else {
		res.send({ message: "false", status: "Password doesn't match" })
	}
}


//username availablity check 
module.exports.userName = (req, res) => {
	// userName= req.body.userName
	User.findOne({ userName: req.body.userName }, (err, userName) => {
		if (err) {
			res.send({ message: err })
		}
		else if (!userName) {
			res.send({ message: "true", status: "Username is available" })
		}
		else {
			res.send({ message: "false", status: "Username is not available" })
		}
	})
}


//profile picture upload api
module.exports.upload = (req, res) => {
	if (req.user._id) {

		upload(req, res, (err) => {
			var filename = serverFile.LocalFile;
			console.log(serverFile.LocalFile)
			var dirPath =  `http://54.210.15.234/tapin/${filename}`;
			var original = serverFile.OriginalName;
			if (err) {
				return res.status(400).send({err});
			}
			else {
				User.findOne({ _id: req.user._id }, (err, userInstance) => {
					if (err) {
						res.send(err)
					}
					else {
					
						userInstance.updateOne({
							"profilePicture": dirPath
						}, (err, uploaded) => {
							if (err) res.send(err)
							else {
								res.send({ message: "Image Uploaded",dirPath })
							}
						})
					}
				})
				let results = req.files.map((file) => {
					
					return {
						mediaName: file.filename,
						origMediaName: file.originalname,
						mediaSource: dirPath
					}
				
				// res.status(200).json(results);
			})
			}
		});
	} else {
		res.send({ message: " user not verified" })
	}
}

var serverFile = { LocalFile: '', DirName: '', OriginalName: '' };
const storage = multer.diskStorage({
	destination: (req, file, callback) => {
		var dirPath = path.resolve(__dirname, '../tapin/uploads');
		
		serverFile.DirName = dirPath;
		
		callback(null, dirPath + '/');
	},
	filename: (req, file, callback) => {
		var filename=Date.now() +'-'+file.originalname
		serverFile.LocalFile= filename;
		callback(null, filename);
	}
});
const upload = multer({ storage: storage }).any('file');
console.log(upload)


//user profile api for welcome screen
module.exports.userProfile = (req, res) => {
	if (req.user._id) {
		User.findOne({ _id: req.user._id }, ["firstName", "lastName", "email", "userName"], (err, userInstance) => {
			if (err) {
				res.send(err)
			} else {
				res.send(userInstance)
			}
		})
	} else {
		res.send({ message: "User not authenticated" })
	}
}

//suggested user api for new user
module.exports.suggestedUser = (req, res) => {
	if (req.user._id) {
		User.find({"$and":[{_id:{$nin:req.user.following}},{_id: { $ne: req.user._id}}]}, (err, users) => {
			if (err) {
				res.send({ message: "Something wrong" })
				console.log(err)
			}
			else {
					res.send(users)
			}
		})
	} else {
		res.send({ message: "Not logged in", status: "fasle" })
	}
}
















