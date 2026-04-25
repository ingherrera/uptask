import type { Request, Response } from "express";
import { prisma } from "./../config/db";
import { checkPassword, hashPassword, tokenExpiration } from "../utils/auth";
import { generateToken } from "../utils/token";
import { AuthEmail } from "../emails/Authemails";
import { generateJWT } from "../utils/jwt";

export class AuthController {
  static createAccount = async (req: Request, res: Response) => {
    try {
      const { name, password, email } = req.body;

      // Prevenir duplicados
      const userExists = await prisma.user.findUnique({
        where: { email },
      });

      if (userExists) {
        const error = new Error("El Usuario ya esta registrado");
        return res.status(409).json({ error: error.message });
      }

      // Hashear Password
      const passwordHash = await hashPassword(password);

      // Crear Token
      const tokenString = generateToken();

      // Crear Usuario
      await prisma.user.create({
        data: {
          name,
          password: passwordHash,
          email,
          Tokens: {
            create: {
              token: tokenString,
              // expiresAt: new Date(),
              expiresAt: new Date(Date.now() + 10 * 60 * 1000), //expira a los 10 minutos
            },
          },
        },
      });

      // Enviar email
      await AuthEmail.sendConfirmationEmail({ email, name, token: tokenString });

      // res.send("Cuenta creada, revisa tu email para confirmarla");
      return res
        .status(201)
        .json({ message: "Cuenta creada, revisa tu email para confirmarla" });
    } catch (error) {
      // console.error("Error en createAccount:", error);
      // res.status(500).json({ error: "Hubo un error" });
      res.status(500).json({ error });
    }
  };

  // static createAccount = (req: Request, res: Response) => {
  //   res.send("Desde /api/auth");
  // };

  static confirmAccount = async (req: Request, res: Response) => {
    try {
      console.log("Se llamo a confirmAccount..");

      const { token }: { token: string } = req.body;

      const tokenExists = await prisma.token.findFirst({
        where: { token },
        include: { user: true },
      });

      if (!tokenExists) {
        const error = new Error("Token no válido");
        return res.status(404).json({ error: error.message });
      }

      // Confirmar la Cuenta si el Token es válido
      if (tokenExpiration(tokenExists.expiresAt) === "notExpired") {
        await prisma.user.update({
          where: { id: tokenExists.userId },
          data: { confirmed: true },
        });
        res.status(200).json({ message: "Cuenta confirmada correctamente" });
      }

      // Eliminar el token de la base de datos
      await prisma.token.delete({
        where: { id: tokenExists.id },
      });

      if (!res.headersSent) {
        res.status(200).json({
          message:
            "No se pudo confirmar la cuenta porque el token ha expirado. Por favor, obtén un nuevo token e inténtalo nuevamente.",
        });
      }
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
      console.log({ error });
    }
  };

  static login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      console.log("Llamando a Login", { email }, { password });

      // Revisar si Usuario existe
      const userExists = await prisma.user.findUnique({
        where: { email },
      });

      if (!userExists) {
        const error = new Error("Usuario no encontrado");
        return res.status(404).json({ error: error.message });
      }

      // Validar si usuario confirmó cuenta
      if (!userExists.confirmed) {
        // Generar un nuevo valor de token
        const newTokenValue = generateToken();

        // Generar Nuevo Token
        const newToken = await prisma.token.create({
          data: {
            token: newTokenValue,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), //expira a los 10 minutos
            user: {
              connect: { id: userExists.id },
            },
          },
        });

        // Enviar el email
        AuthEmail.sendConfirmationEmail({
          email: userExists.email,
          name: userExists.name,
          token: newTokenValue,
        });

        const error = new Error(
          "La cuenta no ha sido confirmada, hemos enviado un e-mail de confirmación",
        );
        return res.status(401).json({ error: error.message });
      }

      // Revisar Password
      const isPasswordCorrect = await checkPassword(password, userExists.password);
      if (!isPasswordCorrect) {
        const error = new Error("Password Incorrecto");
        return res.status(401).json({ error: error.message });
      }

      // Generar JWT
      const token = generateJWT({ id: userExists.id });
      res.send(token);

      // res.json({ msg: "Autenticando.", email, userExists });
      // res.send("Autenticacion correcta...");
    } catch (error) {
      console.log({ error });
      // res.status(500).json({ error: "Hubo un error" });
      res.status(500).json({ error });
    }
  };

  static requestConfirmationCode = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      // Usuario existe
      const userExists = await prisma.user.findUnique({
        where: { email },
      });

      if (!userExists) {
        const error = new Error("El Usuario NO esta registrado");
        return res.status(409).json({ error: error.message });
      }

      // Usuario Confirmado
      if (userExists.confirmed) {
        const error = new Error("El Usuario ya esta confirmado");
        return res.status(403).json({ error: error.message });
      }

      // Crear Token
      const tokenString = generateToken();

      await prisma.token.create({
        data: {
          token: tokenString,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), //expira a los 10 minutos
          user: {
            connect: { id: userExists.id },
          },
        },
      });

      // Enviar email
      await AuthEmail.sendConfirmationEmail({
        email,
        name: userExists.name,
        token: tokenString,
      });
      res.send("Se envió un nuevo token a tu e-mail");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static forgotPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      // Usuario existe
      const userExists = await prisma.user.findUnique({
        where: { email },
      });

      if (!userExists) {
        const error = new Error("El Usuario NO esta registrado");
        return res.status(409).json({ error: error.message });
      }

      // Crear Token
      const tokenString = generateToken();

      await prisma.token.create({
        data: {
          token: tokenString,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), //expira a los 10 minutos
          user: {
            connect: { id: userExists.id },
          },
        },
      });

      // Enviar email
      await AuthEmail.sendPasswordResetToken({
        email,
        name: userExists.name,
        token: tokenString,
      });

      res.send("Revisa tu email para instrucciones");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static validateToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;

      // Token existe
      const tokenExists = await prisma.token.findFirst({
        where: { token },
      });

      if (!tokenExists) {
        const error = new Error("Token no válido");
        return res.status(409).json({ error: error.message });
      }

      res.send("Token válido, Define tu nuevo password");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static updatePasswordWithToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const { password } = req.body;
      const hashedPassword = await hashPassword(password);

      // Token existe
      const tokenExists = await prisma.token.findFirst({
        where: { token },
        include: { user: true }, // Incluye la relación con el usuario
      });

      if (!tokenExists) {
        const error = new Error("Token no válido");
        return res.status(409).json({ error: error.message });
      }

      // Actualizar password de usuario
      await prisma.user.update({
        where: { id: tokenExists.userId },
        data: { password: hashedPassword },
      });

      // Eliminar el token de la base de datos
      await prisma.token.delete({
        where: { id: tokenExists.id },
      });

      res.send("El password se modificó correctamente");
      // res.json(tokenExists);
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static getUser = async (req: Request, res: Response) => {
    return res.json(req.user);
  };

  static updateProfile = async (req: Request, res: Response) => {
    const { name, email } = req.body;

    // Prevenir duplicados
    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    // Quien actualiza su perfil tiene que se distinto a Usuario que tiene asignado el correo ingresado en ProfileForm
    if (userExists && req.user.id !== userExists.id) {
      const error = new Error("Ese email ya esta registrado");
      return res.status(409).json({ error: error.message });
    }

    // Actualizamos datos del usuario Autenticado obtenidos de "ProfileForm"
    req.user.name = name;
    req.user.email = email;

    try {
      // Actualizar Perfil de usuario(name y email)
      await prisma.user.update({
        where: { id: req.user.id },
        data: { name, email },
      });
      return res.send("Actualizar Perfil");
    } catch (error) {
      // res.status(500).send("Hubo un error");
      res.status(500).send(error);
    }
  };

  static updateCurrentUserPassword = async (req: Request, res: Response) => {
    const { current_password, password } = req.body;

    // Buscamos al usuario autenticado
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    // Comparar password ingresada por Usuario vs almacenado
    const isPasswordCorrect = await checkPassword(current_password, user.password);

    if (!isPasswordCorrect) {
      const error = new Error("El Password actual es incorrecto");
      return res.status(401).json({ error: error.message });
    }

    try {
      const hashedPassword = await hashPassword(password);

      await prisma.user.update({
        where: { id: req.user.id },
        data: { password: hashedPassword },
      });
      res.send("El Password se modificó correctamente");
    } catch (error) {
      res.status(500).send("Hubo un error");
    }
  };

  static checkPassword = async (req: Request, res: Response) => {
    const { password } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    const isPasswordCorrect = await checkPassword(password, user.password);
    if (!isPasswordCorrect) {
      const error = new Error("El Password es incorrecto");
      return res.status(401).json({ error: error.message });
    }

    res.send("Password Correcto");
  };
}
