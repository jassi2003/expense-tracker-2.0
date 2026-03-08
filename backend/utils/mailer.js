import nodemailer from "nodemailer";
import dotenv from "dotenv"


dotenv.config()

// console.log(ADMIN_EMAIL)
// console.log(ADMIN_PASSWORD)

export const sendReportEmail = async ({ email, excelBuffer }) => {

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.ADMIN_EMAIL,
      pass: process.env.GMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.ADMIN_EMAIL,
    to: email,
    subject: "Expense Analytics Report",
    text: "Your requested expense report is attached.",
    attachments: [
      {
        filename: "expense-report.xlsx",
        content: excelBuffer
      }
    ]
  });

};