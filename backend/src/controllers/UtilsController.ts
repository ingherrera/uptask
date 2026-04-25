import type { Request, Response } from "express";
import { pool } from "../config/mysql";

import colors from "colors";

export class UtilsController {
  static resetAutoIncrement =  async (req: Request, res: Response) => {
    try {
      await pool.query("DELETE FROM token;")
      await pool.query("DELETE FROM user;")
      await pool.query("ALTER TABLE user AUTO_INCREMENT = 1;");
      await pool.query("ALTER TABLE token AUTO_INCREMENT = 1;");
      res.json({msg1: "resetAutoIncrement"});
    } catch (error) {
      console.error("Error al ejecutar las instrucciones SQL:", error);
    }
  };

  static clearScreen = (req: Request, res: Response) => {
    process.stdout.write("\x1B[2J\x1B[3J\x1B[H");
    res.status(200).send("Pantalla limpia");
    console.log(colors.bgBlack.white("Backend upTask-Prisma ORM"));
  };
}
