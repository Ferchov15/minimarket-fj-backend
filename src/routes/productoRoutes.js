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

// Crear producto con imagen
router.post("/", upload.single("imagen"), crearProducto);

// Obtener productos
router.get("/", obtenerProductos);

// Obtener uno
router.get("/:id", obtenerProductoPorId);

// Actualizar (imagen opcional)
router.put("/:id", upload.single("imagen"), actualizarProducto);

// Eliminar
router.delete("/:id", eliminarProducto);

export default router;
