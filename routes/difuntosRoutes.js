import express from "express";
import {
  obtenerDifuntos,
  crearDifunto,
  editarDifunto,
  eliminarDifunto,
} from "../controllers/difuntosController.js";

const router = express.Router();

router.get("/", obtenerDifuntos);
router.post("/", crearDifunto);
router.put("/:id", editarDifunto);
router.delete("/:id", eliminarDifunto);

export default router;
