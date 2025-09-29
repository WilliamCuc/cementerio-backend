import express from "express";
import {
  obtenerTransacciones,
  obtenerTransaccionesPorEspacio,
  crearTransaccion,
  editarTransaccion,
  eliminarTransaccion,
  resumenPagosEspacio,
} from "../controllers/transaccionesController.js";

const router = express.Router();

router.get("/", obtenerTransacciones);
router.get("/espacio/:espacioId", obtenerTransaccionesPorEspacio);
router.get("/resumen/:espacioId", resumenPagosEspacio);
router.post("/", crearTransaccion);
router.put("/:id", editarTransaccion);
router.delete("/:id", eliminarTransaccion);

export default router;