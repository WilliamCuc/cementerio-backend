import express from "express";
import {
  obtenerMovimientos,
  crearMovimiento,
  editarMovimiento,
  eliminarMovimiento,
} from "../controllers/movimientoController.js";

const router = express.Router();

router.get("/", obtenerMovimientos);
router.post("/", crearMovimiento);
router.put("/:id", editarMovimiento);
router.delete("/:id", eliminarMovimiento);

export default router;
