import express from "express";
import {
  obtenerUsuarios,
  crearUsuario,
  login,
} from "../controllers/usuariosController.js";

const router = express.Router();

router.get("/", obtenerUsuarios);
router.post("/", crearUsuario);
router.post("/login", login);

export default router;
