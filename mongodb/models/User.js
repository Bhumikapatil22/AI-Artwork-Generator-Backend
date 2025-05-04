import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  isVerified: { type: Boolean, default: false },
  otp: {
    code: String,
    expiresAt: Date
  }
});

export default mongoose.model('User', userSchema);
