import { Router } from "express";
import { UtilsController } from "../controllers/UtilsController";

const router = Router();

router.get("/clear-screen", UtilsController.clearScreen);

router.get("/reset-autoincrement", UtilsController.resetAutoIncrement
);


export default router;
