const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  auth: {
    user: "rickyyyyykn01@gmail.com",
    pass: "Suprise01",
  },
  host: "smtp.gmail.com",
});

const mailer = async ({ subject, to, text, html }) => {
  await transport.sendMail({
    subject: subject || "Test Subject",
    to: to || "rickyyyyykn25@gmail.com",
    text: text || "test nodemailer",
    html: html || "<h1>This is sent from my express API</h1> ",
  });
};

module.exports = mailer;
