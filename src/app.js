import express from "express";
import cors from "cors";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import productoRoutes from "./routes/productoRoutes.js";
import pedidoRoutes from "./routes/pedidoRoutes.js";

const app = express();

// Conexición con el Frontend
const FRONTEND_URLS = [
  "http://localhost:3000",      
  "http://192.168.1.6:3000"
];

app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/pedidos", pedidoRoutes);

export default app;
