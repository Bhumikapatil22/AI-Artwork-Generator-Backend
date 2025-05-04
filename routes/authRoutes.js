import express from 'express';
const router = express.Router();

import {
  sendOTP,
  verifyOTP,
  signup,
  login
} from '../controller/authController.js';

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/signup', signup);
router.post('/login', login);

export default router;
