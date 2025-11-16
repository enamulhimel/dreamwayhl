// utils/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: 465,
  secure: true,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  pool: true,
  maxConnections: 5,
  rateLimit: 5
});

const sendContactEmail = async (name, email, phone, subject, message) => {
  await transporter.sendMail({
    from: `"Dreamway" <${process.env.SMTP_USER}>`,
    to: "info@dreamwayhl.com",
    subject: `New Contact: ${subject}`,
    text: `From: ${name}\nEmail: ${email}\nPhone: ${phone}\n\n${message}`
  });
};

module.exports = { sendContactEmail };