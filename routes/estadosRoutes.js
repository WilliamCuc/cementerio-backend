import { Router } from "express";
import { obtenerEstados } from "../controllers/estadosController.js";

const router = Router();
router.get("/", obtenerEstados);

export default router;