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
    try {
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
          <p>Pozdrawiamy :33</p>
        `,
      });
      console.log(`E-mail wysłany do: ${toEmail}`);
    } catch (error) {
      console.error("Błąd wysyłania maila:", error);
    }
  }

  async sendRejectionEmail(toEmail, username, reason) {
    try {
      await transporter.sendMail({
        from: `"ProgTalk Admin" <${process.env.GMAIL_EMAIL}>`,
        to: toEmail,
        subject: "Twoja rejestracja w ProgTalk została odrzucona",
        html: `
                <h1>Cześć ${username}!</h1>
                <p>Przykro nam, ale Twoja rejestracja w serwisie <b>ProgTalk</b> została odrzucona.</p>
                <p>Powód odrzucenia: ${reason}</p>
                <p>Jeśli uważasz, że to pomyłka, skontaktuj się z nami.</p>
                <br>
                <p>Pozdrawiamy :33</p>
            `,
      });
      console.log(`E-mail odrzucenia wysłany do: ${toEmail}`);
    } catch (error) {
      console.error("Błąd wysyłania maila:", error);
    }
  }
}

module.exports = new EmailService();
