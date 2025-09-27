import express from "express";
import {
  obtenerPanteones,
  obtenerTodosPanteones,
  crearPanteon,
  editarPanteon,
  eliminarPanteon,
} from "../controllers/panteonesController.js";

const router = express.Router();

router.get("/", obtenerPanteones);
router.get("/todos", obtenerTodosPanteones);
router.post("/", crearPanteon);
router.put("/:id", editarPanteon);
router.delete("/:id", eliminarPanteon);

export default router;
