import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import User from '../models/User.js'
import Comment from '../models/Comment.js';
import Review from '../models/Review.js';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const router = Router();

// Load environment variables from .env.local file
dotenv.config({ path: '.env.local' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory where photos are stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Add a unique filename
  },
});

const upload = multer({ storage });

const uploadToCloud = async (file) => {
  const result = await cloudinary.uploader.upload(file.path);
  return result.secure_url; // Return the URL of the uploaded image
};

router.get('/', authenticate,  async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.user.userId });

        if (!user) {
        return res.status(404).json({ message: "User not found" });
        }

        res.json({user});
    } catch (err) {
        console.log(err)
        res.status(500).json({message: "Can't Fetch User ! Server Error !"})
    }
})

router.post('/', authenticate, async (req, res) => {
  try {
    const { userId, displayname, username, email } = req.body

    // Check if email already exists for another user
    const existingUserWithEmail = await User.findOne({
      email,
      userId: { $ne: userId }, // Exclude the current user from the check
    });

    if (existingUserWithEmail) {
      return res.status(400).json({
        message: 'Email already exists for another user !',
      });
    }

    // Check if username already exists for another user
    const existingUserWithUsername = await User.findOne({
      username,
      userId: { $ne: userId }, // Exclude the current user from the check
    });

    if (existingUserWithUsername) {
      return res.status(400).json({
        message: 'Username already exists for another user !',
      });
    }

    const updatedUser = await User.findOneAndUpdate({userId}, {displayname, username, email}, {new: true})
    const updatedComments = await Comment.updateMany({userId}, {userDisplayName: displayname, userUsername: username}, {new: true})
    const updatedReview = await Review.findOneAndUpdate({userId}, {userDisplayName: displayname, userUsername: username}, {new: true})

    res.json({user: updatedUser, message: "User Updated Successfully !"})

  } catch (err) {
    return res.status(500).json({message: "Failed To Update User ! Server Error !"})
  }
    
});

router.post('/uploadProfilePic', authenticate, upload.single('profilePic'), async (req, res) => {
  try {
    const profilePic = await uploadToCloud(req.file); // Upload to Cloudinary and get the URL

    const user = await User.findOneAndUpdate({userId: req.user.userId}, { profilePic }, { new: true });
    await Comment.updateMany({userId: req.user.userId}, {userProfilePic: profilePic})
    await Review.findOneAndUpdate({userId: req.user.userId}, {userProfilePic: profilePic})

    res.json({user});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


const transporter = nodemailer.createTransport({
  service: 'gmail',
  secure: true,
  port: 465,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const generateCode = () => {
  return crypto.randomBytes(3).toString('hex'); // Generates a 6-character random code
};

//When forgot password page loads for the First Time
router.get('/forgotpassword', async (req, res) => {
  try {
   
    const { identifier } = req.query
    
    const user = await User.findOne({$or: [{username: identifier}, {email: identifier}]})

    if (!user) {
      return res.status(404).json({message: "User Not Found !"})
    }

    const verificationCode = generateCode()

    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: 'Password Reset Code',
      text: `Your Password Reset Code is: ${verificationCode}`
    }

    try {
      await transporter.sendMail(mailOptions)
      await User.findOneAndUpdate({userId: user.userId}, {verificationCode})

      res.status(200).json({user, message: "Code Sent !"})
    } catch (err) {
      return res.status(500).json({message: "Error Sending Code !"})
    }
    
  } catch (err) {
    return res.status(500).json({message: "Server Error From Forgotpassword !"})
  }
})

//Resend Code after 1 Minute
router.get('/resendcode', async (req, res) => {
  try {
    const userId = req.query.id

    const user = await User.findOne({userId})

    const verificationCode = generateCode()

    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: 'Password Reset Code',
      text: `Your Password Reset Code is: ${verificationCode}`
    }

    try {
      await transporter.sendMail(mailOptions)
      await User.findOneAndUpdate({userId}, {verificationCode})

      res.status(200).json({message: "Code Sent !"})
    } catch (err) {
      return res.status(500).json({message: "Error Sending Code !"})
    }

  } catch (err) {
    return res.status(500).json({message: "Can't Resend Code ! Server Error !"})
  }
})

//Reset Password
router.post('/resetpassword', async (req, res) => {
  try {
    const userId = req.query.id

    const { code, password } = req.body

    const user = await User.findOne({userId})

    if (user.verificationCode !== code) {
      return res.status(400).json({message: "Invalid Verification Code !"})
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const updatedUser = await User.findOneAndUpdate({userId}, {password: hashedPassword})

    res.status(200).json({message: "Password Reset Successful !"})

  } catch (err) {
    return res.status(500).json({message: "Can't Reset Password ! Server Error !"})
  }
})

export default router;