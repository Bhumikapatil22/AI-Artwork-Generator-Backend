import bcrypt from 'bcrypt';
import User from '../mongodb/models/User.js';
import { sendOTPEmail } from '../utils/mailer.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
export const sendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ email });
    }

    user.otp = {
      code: otp,
      expiresAt,
    };

    await user.save();
    await sendOTPEmail(email, otp);

    res.status(200).json({ success: true, message: 'OTP sent to email' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
};

export const verifyOTP = async (req, res) => {
  const { email, enteredOtp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !user.otp || !user.otp.code) {
      return res.status(400).json({ message: 'No OTP found or user does not exist' });
    }

    if (user.otp.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    if (user.otp.code !== enteredOtp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    user.isVerified = true;
    user.otp = {}; // Clear OTP after verification
    await user.save();

    return res.status(200).json({ success: true, message: 'OTP verified' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Error verifying OTP' });
  }
};
const JWT_SECRET=process.env.JWT_SECRET;
export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ error: 'All fields are required' });

  try {
    const user = await User.findOne({ email });

    if (!user || !user.isVerified) {
      return res.status(403).json({ error: 'OTP verification required' });
    }

    if (user.password) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.name = name;
    user.password = hashedPassword;

    await user.save();

    // ✅ Generate JWT Token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'Signup successful',
      token,
      user: { name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  try {
    const user = await User.findOne({ email });

    if (!user || !user.password) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    // ✅ Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name  },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // ✅ Send token with user info
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};
