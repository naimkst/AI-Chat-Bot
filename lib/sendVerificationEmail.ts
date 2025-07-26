import FormData from "form-data"; // v4.0.1
import Mailgun from "mailgun.js"; // v11.1.0

const DOMAIN = "sandbox000f304afc9c4835a118e845d6a56d7a.mailgun.org";

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/verify?token=${token}`;

  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY || "API_KEY",
    // Uncomment and use this if your domain is EU-based:
    // url: "https://api.eu.mailgun.net"
  });

  try {
    const data = await mg.messages.create(DOMAIN, {
      from: `Support <support@${DOMAIN}>`,
      to: [email],
      subject: "Verify your email address",
      html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email.</p>`,
    });
    console.log("Mailgun verification sent:", data);
  } catch (error) {
    console.error("Mailgun error:", error);
    throw error;
  }
}