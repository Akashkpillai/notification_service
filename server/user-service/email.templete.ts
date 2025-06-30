export class EmailTemplates {
    static activationEmail(activationLink: string): string {
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    background-color: #f9f9f9;
                    color: #333;
                    margin: 0;
                    padding: 0;
                }
                .email-container {
                    max-width: 600px;
                    margin: 20px auto;
                    background: #ffffff;
                    border-radius: 10px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .header {
                    background-color: #ff5e79;
                    padding: 20px;
                    text-align: center;
                    color: #fff;
                }
                .header h1 {
                    margin: 0;
                    font-size: 28px;
                }
                .content {
                    padding: 20px;
                    text-align: center;
                }
                .content p {
                    font-size: 16px;
                    margin-bottom: 20px;
                    line-height: 1.5;
                }
                .cta-button {
                    display: inline-block;
                    padding: 12px 25px;
                    font-size: 16px;
                    color: #ffffff;
                    background-color: #ff5e79;
                    border-radius: 25px;
                    text-decoration: none;
                    font-weight: bold;
                }
                .footer {
                    text-align: center;
                    padding: 15px;
                    font-size: 12px;
                    color: #888;
                    background-color: #f3f3f3;
                }
                .footer a {
                    color: #ff5e79;
                    text-decoration: none;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <h1>Welcome to CUPID! ❤️</h1>
                </div>
                <div class="content">
                    <p>Thank you for signing up! Please activate your account by clicking the button below:</p>
                    <p>
                        <a href="${activationLink}" class="cta-button">Activate Account</a>
                    </p>
                    <p>If the button doesn't work, copy and paste this link into your browser:</p>
                    <p><a href="${activationLink}" style="color: #ff5e79;">activationLink</a></p>
                </div>
                <div class="footer">
                    <p>Need help? <a href="#">Contact us</a></p>
                    <p>© 2024 CUPID. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
      `;
    }
}
