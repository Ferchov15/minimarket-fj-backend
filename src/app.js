import express from "express";
import cors from "cors";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import productoRoutes from "./routes/productoRoutes.js";
import pedidoRoutes from "./routes/pedidoRoutes.js";
import cookieParser from "cookie-parser";

const app = express();

// Frontends permitidos
const FRONTEND_URLS = [
  "http://localhost:3000",
  "http://192.168.1.6:3000",
  process.env.FRONTEND_URL 
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (FRONTEND_URLS.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("No permitido por CORS"));
  },
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Rutas
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/pedidos", pedidoRoutes);

export default app;
