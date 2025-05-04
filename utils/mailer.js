import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendOTPEmail = async (to, otp) => {
  try {
    await transporter.sendMail({
      from: `"OTP Auth" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Your OTP Code",
      html: `<h2>Your OTP Code is: ${otp}</h2>`
    });
    
  } catch (err) {
    console.error('Failed to send OTP email:', err);
    throw new Error('Email send failed');
  }
};
