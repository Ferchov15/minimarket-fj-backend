import express from "express";
import {
  registrarUsuario,
  loginUsuario,
  listarUsuarios,
  obtenerUsuario,
  actualizarUsuario,
  eliminarUsuario,
  logoutUsuario
} from "../controllers/usuarioController.js";

const router = express.Router();

router.post("/registrar", registrarUsuario);
router.post("/login", loginUsuario);
router.get("/listar", listarUsuarios);
router.get("/:id", obtenerUsuario);
router.put("/:id", actualizarUsuario);
router.delete("/:id", eliminarUsuario);
router.post("/logout", logoutUsuario);

export default router;
