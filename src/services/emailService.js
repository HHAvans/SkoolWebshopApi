
const nodemailer = require('nodemailer');
require('dotenv').config();

// Helper function to wrap text in HTML structure
function wrapInHtml(content) {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: Arial, sans-serif;
                }
                .container {
                    padding: 20px;
                }
                .footer {
                    margin-top: 20px;
                    font-size: 12px;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <div class="container">
                ${content.replace(/\n/g, '<br>')}
                <div class="footer">
                    <p>Veilingkade 15 | 4815 HC Breda | <b>Tel.</b> 085 - 0653923 | <b>App.</b> 06 - 28318842</p>
                    <p><b>Mail.</b> <a href="mailto:info@skoolworkshop.nl">info@skoolworkshop.nl</a> | <b>Web.</b> <a href="https://www.skoolworkshop.nl">www.skoolworkshop.nl</a></p>
                </div>
            </div>
        </body>
        </html>
    `;
}

// Function to send email
async function sendEmail(to, subject, html) {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            html,  // Use 'html' instead of 'text'
        };
        console.log(mailOptions);
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully!");
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}

module.exports = { sendEmail, wrapInHtml };