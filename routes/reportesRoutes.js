import express from "express";
import {
  resumenGeneral,
  ingresosPorPeriodo,
  cuentasPorCobrar,
  ocupacionPorArea,
  difuntosPorPeriodo,
  estadoPanteones,
  movimientosRecientes,
  espaciosDisponibles,
  resumenFinancieroPorEspacio,
  topDeudores,
} from "../controllers/reportesController.js";

const router = express.Router();

router.get("/resumen-general", resumenGeneral);
router.get("/ingresos-periodo", ingresosPorPeriodo);
router.get("/cuentas-cobrar", cuentasPorCobrar);
router.get("/ocupacion-area", ocupacionPorArea);
router.get("/difuntos-periodo", difuntosPorPeriodo);
router.get("/estado-panteones", estadoPanteones);
router.get("/movimientos-recientes", movimientosRecientes);
router.get("/espacios-disponibles", espaciosDisponibles);
router.get("/resumen-financiero", resumenFinancieroPorEspacio);
router.get("/top-deudores", topDeudores);

export default router;