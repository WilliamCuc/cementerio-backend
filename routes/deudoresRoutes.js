import express from "express";
import {
  obtenerDeudores,
  detalleDeudaEncargado,
  historialPagosEspacio,
  exportarDeudores,
} from "../controllers/deudoresController.js";

const router = express.Router();

router.get("/", obtenerDeudores);
router.get("/encargado/:encargadoId", detalleDeudaEncargado);
router.get("/historial/:espacioId", historialPagosEspacio);
router.get("/exportar", exportarDeudores);

export default router;