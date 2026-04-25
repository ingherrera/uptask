import { transporter } from "../config/nodemailer";

interface IUserEmail {
  email: string,
  name: string,
  token: string
}

export class AuthEmail {
  static sendConfirmationEmail = async ({ email, name, token }: IUserEmail) => {
    try {
      const info = await transporter.sendMail({
        from: "upTask <admin@uptask.com>",
        to: email,
        subject: "UpTask - Confirma tu cuenta",
        html: `<p>Hola: ${name}, has creado tu cuenta en UpTask, ya casi esta todo listo, solo debes confirmar tu cuenta</p>
        <p>Ingresa el código: <b>${token}</b></p>
        <p>Este token expira en 10 minutos</p>
        `,
      });
      console.log("Mensaje enviado: ", info.messageId);
    } catch (error) {
      console.error("Error enviando correo: ", error);
    }
  };


  static sendPasswordResetToken = async (user: IUserEmail) => {
    try {
      const info = await transporter.sendMail({
        from: "UpTask <admin@uptask.com>",
        to: user.email,
        subject: "UpTask - Restablece tu password",
        text: "UpTask - Restablece tu password",
        html: ` <p>Hola: ${user.name}, has solicitado restablecer tu password.</p>
                <p>Visita el siguiente enlace:</p>
                <a href="${process.env.FRONTEND_URL}/auth/new-password">Restablecer Password</a>
                <p>E ingresa el código: <b>${user.token}</b></p>
                <p>Este token expira en 10 minutos</p>
              `,
      });
      console.log("Mensaje enviado", info.messageId);      
    } catch (error) {
      console.error("Error enviando correo para Restablecer Password: ", error);
    }
  };
  
}
