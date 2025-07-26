import nodemailer from 'nodemailer';

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/verify?token=${token}`;

  const transporter = nodemailer.createTransport({
    host: "smtp.mailgun.org",
    port: 587,
    secure: false,
    auth: {
      user: "support@sandbox000f304afc9c4835a118e845d6a56d7a.mailgun.org",
      pass: "CaddieAdmin123!Golf",
    },
  });

  await transporter.sendMail({
    from: "support@sandbox000f304afc9c4835a118e845d6a56d7a.mailgun.org",
    to: email,
    subject: 'Verify your email address',
    html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email.</p>`,
  });
}