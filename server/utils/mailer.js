const nodemailer = require("nodemailer");

let transporter = null;

const createEtherealTransporter = async () => {
  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  console.log("Email fallback enabled: Ethereal test account created.");
  return transporter;
};

/**
 * Uses real SMTP if EMAIL_* vars are configured, otherwise creates a local
 * Ethereal test account so reminder emails can still be sent in development.
 */
const getTransporter = async () => {
  if (transporter) return transporter;

  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;

  if (EMAIL_HOST && EMAIL_USER && EMAIL_PASS) {
    try {
      const configuredTransport = nodemailer.createTransport({
        host: EMAIL_HOST,
        port: Number(EMAIL_PORT) || 587,
        secure: Number(EMAIL_PORT) === 465,
        requireTLS: Number(EMAIL_PORT) === 587,
        family: Number(process.env.EMAIL_FAMILY) || undefined,
        connectionTimeout: 20000,
        greetingTimeout: 20000,
        socketTimeout: 30000,
        auth: { user: EMAIL_USER, pass: EMAIL_PASS },
      });

      await configuredTransport.verify();
      transporter = configuredTransport;
      return transporter;
    } catch (error) {
      throw new Error(`SMTP verification failed: ${error.message}`);
    }
  }

  return createEtherealTransporter();
};

const sendMail = async ({ to, subject, text, html }) => {
  const t = await getTransporter();
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'ClassPilot <no-reply@classpilot.local>';

  try {
    const info = await t.sendMail({ from, to, subject, text, html });

    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const isConfiguredTransport = t.options?.host === process.env.EMAIL_HOST;
      if (!isConfiguredTransport) {
        console.log("Reminder preview URL:", nodemailer.getTestMessageUrl(info));
      }
      return info;
    }

    console.log("Reminder preview URL:", nodemailer.getTestMessageUrl(info));
    return info;
  } catch (error) {
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      throw error;
    }

    const fallback = await createEtherealTransporter();
    const fallbackInfo = await fallback.sendMail({
      from: process.env.EMAIL_FROM || "ClassPilot <no-reply@classpilot.local>",
      to,
      subject,
      text,
      html,
    });

    console.log("Reminder fallback preview URL:", nodemailer.getTestMessageUrl(fallbackInfo));
    return fallbackInfo;
  }
};

module.exports = { sendMail };
