import nodemailer from 'nodemailer';

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `http://localhost:3000/api/verify?token=${token}`;

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "psdtoshopifyservice@gmail.com",
      pass: "lqimgcxhoqbnootd",
    },
  });

  await transporter.sendMail({
    from: "psdtoshopifyservice@gmail.com",
    to: email,
    subject: 'Verify your email address',
    html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email.</p>`,
  });
}