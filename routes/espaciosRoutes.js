import express from "express";
import {
  obtenerEspacios,
  obtenerEspaciosDisponibles,
  crearEspacio,
  editarEspacio,
  eliminarEspacio,
} from "../controllers/espaciosController.js";

const router = express.Router();

router.get("/", obtenerEspacios);
router.get("/disponibles", obtenerEspaciosDisponibles);
router.post("/", crearEspacio);
router.put("/:id", editarEspacio);
router.delete("/:id", eliminarEspacio);

export default router;
