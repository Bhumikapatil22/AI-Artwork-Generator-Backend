import express from 'express';
import * as dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import { verifyToken } from '../middleware/Middleware.js'; // or your actual middleware path

import Post from '../mongodb/models/post.js';

dotenv.config();

const router = express.Router();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// router.route('/').get(async (req, res) => {
//     try {
//         const posts = await Post.find({});
//         res.status(200).json({ success: true, data: posts });
//     } catch (err) {
//         res.status(500).json({ success: false, message: 'Fetching posts failed, please try again' });
//     }
// });

router.route('/').get(async (req, res) => {
    try {
      const posts = await Post.find().sort({ createdAt: -1 }).populate('user', 'name');
      res.status(200).json({ success: true, data: posts });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Unable to fetch community posts',
      });
    }
  });
  
  router.route('/my-posts').get( async (req, res) => {
    try {
      const posts = await Post.find({ user: req.user.id }).sort({ createdAt: -1 });
      res.status(200).json({ success: true, data: posts });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Unable to fetch your posts',
      });
    }
  });
  


// router.route('/').post(verifyToken, async (req, res) => {
//   try {
//     const { prompt, photo } = req.body;

//     const photoUrl = await cloudinary.uploader.upload(photo);

//     const newPost = await Post.create({
//       prompt,
//       photo: photoUrl.url,
//       user: req.user.id, // directly from JWT token
//     });

//     res.status(200).json({ success: true, data: newPost });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: 'Unable to create a post, please try again',
//     });
//   }
// });


// export default router;

router.route('/').post(async (req, res) => {
    try {
      const { prompt, photo } = req.body;
  
      const photoUrl = await cloudinary.uploader.upload(photo);
  
      const newPost = await Post.create({
        prompt,
        photo: photoUrl.url,
        user: req.user.id, // assuming req.user is set by verifyToken
      });
  
      res.status(200).json({ success: true, data: newPost });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Unable to create a post, please try again',
      });
    }
  });
  export default router;