export function signupEmailTemplate(data: {
    name: string;
    token: string;
    frontendUrl: string;
}) {
    return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - AwoofHub</title>

    <style>
      @import url("https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&display=swap");
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { background-color: #f4f4f4; font-family: "Montserrat", Arial, sans-serif; }
      .wrapper { background-color: #f4f4f4; padding: 40px 16px; width: 100%; }
      .email-container { background-color: #ffffff; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); width: 600px; }
      .header { background-color: #fe4f04; padding: 3rem 4rem; text-align: center; }
      .header h1 { color: #ffffff; font-family: "Baloo 2", Arial, sans-serif; font-size: 32px; font-weight: 700; line-height: 1.2; }
      .email-body { padding: 40px; }
      .email-body h2 { font-family: "Montserrat", Arial, sans-serif; font-size: 16px; color: #0c0c0c; font-weight: 700; }
      .email-body p { font-family: "Montserrat", Arial, sans-serif; font-size: 16px; color: #595858; line-height: 1.5; margin-bottom: 18px; }
      .highlight { color: #595858; font-weight: 700; }
      .btn-cell { padding-bottom: 28px; }
      .email-body p.verify-text { color: #fe4f04 !important; font-weight: 700; margin-bottom: 6px; }
      .email-button { display: inline-block; padding: 10px; background-color: #fe4f04; color: #ffffff; text-decoration: none; border-radius: 4px; font-family: "Baloo 2", Arial, sans-serif; font-size: 20px; font-weight: 500; width: 280px; letter-spacing: 0.5px; text-align: center; }
      .ignore { font-size: 16px !important; font-style: italic; font-weight: 500; color: #595858; font-family: "Montserrat", Arial, sans-serif; }
      .email-body p.appreciation { margin-top: 16px; font-size: 16px; font-weight: 500; color: #595858; }
      .footer { background-color: #fe4f04; padding: 2rem; text-align: end; }

      @media only screen and (max-width: 600px) {
        .email-container { width: 100% !important; }
        .email-body { padding: 24px 20px !important; }
        .header h1 { font-size: 22px !important; }
      }
    </style>
  </head>

  <body>
    <table class="wrapper" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table class="email-container" cellpadding="0" cellspacing="0">

            <tr>
              <td class="header">
                <h1>Verify your email to finish signing up!</h1>
              </td>
            </tr>

            <tr>
              <td class="email-body">
                <h2>Hi ${data.name},</h2>

                <p>
                  Welcome to <span class="highlight">AwoofHub!</span>
                </p>

                <p class="last">
                  Please confirm your email address to complete your sign up and start discovering great deals.
                </p>

                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td class="btn-cell">
                      <p class="verify-text">Click the button to verify:</p>

                      <a class="email-button"
                         href="${data.frontendUrl}/verify-email?token=${data.token}">
                        Verify Email Address
                      </a>
                    </td>
                  </tr>
                </table>

                <p class="ignore">
                  If you did not create this account, you can safely ignore this message.
                </p>

                <p class="appreciation">
                  Thanks for joining us,<br>
                  <span style="font-weight: 700; color: #0c0c0c">The AwoofHub Team.</span>
                </p>
              </td>
            </tr>

            <tr>
              <td class="footer">
                <img
                  src="https://pub-24c34059b34943d1a950bfdb90169a52.r2.dev/media/LogoWhite.png"
                  alt="AwoofHub Logo"
                  width="150"
                />
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;
}