const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_PASSWORD,
  },
});

class EmailService {
  async sendApprovalEmail(toEmail, username) {
    await transporter.sendMail({
      from: `"ProgTalk Admin" <${process.env.GMAIL_EMAIL}>`,
      to: toEmail,
      subject: "Witaj w ProgTalk! Twoje konto jest aktywne",
      html: `
        <h1>Cześć ${username}!</h1>
        <p>Mamy dobrą wiadomość.</p>
        <p>Administrator zaakceptował Twoje konto w serwisie <b>ProgTalk</b>.</p>
        <p>Możesz się teraz zalogować i brać udział w dyskusjach.</p>
        <br>
        <p>Pozdrawiamy, Zespół ProgTalk</p>
      `,
    });
    console.log(`E-mail akceptacyjny wysłany do: ${toEmail}`);
  }

  async sendRejectionEmail(toEmail, username, reason) {
    await transporter.sendMail({
      from: `"ProgTalk Admin" <${process.env.GMAIL_EMAIL}>`,
      to: toEmail,
      subject: "Twoja rejestracja w ProgTalk została odrzucona",
      html: `
        <h1>Cześć ${username},</h1>
        <p>Przykro nam, ale Twoja rejestracja w serwisie <b>ProgTalk</b> została odrzucona.</p>
        <p><b>Powód odrzucenia:</b> ${reason}</p>
        <p>Jeśli uważasz, że to pomyłka, skontaktuj się z nami.</p>
        <br>
        <p>Pozdrawiamy, Zespół ProgTalk</p>
      `,
    });
    console.log(`E-mail odrzucenia wysłany do: ${toEmail}`);
  }

  async sendVerificationEmail(toEmail, verificationToken) {
    const clientUrl = process.env.CLIENT_URL;
    const verificationUrl = `${clientUrl}/verify-email/${verificationToken}`;

    const message = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h1>Weryfikacja adresu e-mail w ProgTalk</h1>
        <p>Dziękujemy za rejestrację!</p>
        <p>Kliknij w poniższy link, aby potwierdzić swój adres e-mail:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">POTWIERDŹ E-MAIL</a>
        <p>Link jest ważny przez 24 godziny.</p>
        <p style="font-size: 12px; color: gray;">Jeśli to nie Ty zakładałeś konto, zignoruj tę wiadomość.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"ProgTalk Security" <${process.env.GMAIL_EMAIL}>`,
      to: toEmail,
      subject: "Potwierdź swój adres e-mail (ProgTalk)",
      html: message,
    });
    console.log(`Mail weryfikacyjny wysłany do: ${toEmail}`);
  }
}

module.exports = new EmailService();
