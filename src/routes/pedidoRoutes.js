import express from "express";
import { crearPedido, obtenerPedidos , actualizarEstadoPedido, obtenerPedidoPorId} from "../controllers/pedidoController.js";

const router = express.Router();

router.post("/", crearPedido);
router.get("/", obtenerPedidos);
router.put("/:id", actualizarEstadoPedido);
router.get("/:id", obtenerPedidoPorId);

export default router;
