import express from "express";
import {
  crearProducto,
  obtenerProductos,
  obtenerProductoPorId,
  actualizarProducto,
  eliminarProducto,
} from "../controllers/productoController.js";

import upload from "../config/multerCloud.js";

const router = express.Router();

router.post("/", upload.single("imagen"), crearProducto);
router.get("/", obtenerProductos);
router.get("/:id", obtenerProductoPorId);
router.put("/:id", upload.single("imagen"), actualizarProducto);
router.delete("/:id", eliminarProducto);

export default router;
