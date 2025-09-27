import express from "express";
import {
  obtenerLocaciones,
  obtenerTodasLocaciones,
  crearLocacion,
  editarLocacion,
  eliminarLocacion,
} from "../controllers/locacionesController.js";

const router = express.Router();

router.get("/", obtenerLocaciones);
router.get("/todas", obtenerTodasLocaciones);
router.post("/", crearLocacion);
router.put("/:id", editarLocacion);
router.delete("/:id", eliminarLocacion);

export default router;
