// routes/encargadosRoutes.js
import express from "express";
import {
  obtenerEncargados,
  crearEncargado,
  editarEncargado,
  eliminarEncargado,
} from "../controllers/encargadosController.js";

const router = express.Router();

router.get("/", obtenerEncargados);
router.post("/", crearEncargado);
router.put("/:id", editarEncargado);
router.delete("/:id", eliminarEncargado);

export default router;
