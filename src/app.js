import express from "express";
import cors from "cors";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import productoRoutes from "./routes/productoRoutes.js";
import pedidoRoutes from "./routes/pedidoRoutes.js";
import cookieParser from "cookie-parser";

const app = express();

const FRONTEND_URLS = [
  "http://localhost:3000",
  "https://minimarket-jk.vercel.app"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:3000",
      "https://minimarket-jk.vercel.app"
    ];

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(null, true); 
  },
  credentials: true,
}));


app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});
app.use(express.json());
app.use(cookieParser());

// Rutas
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/pedidos", pedidoRoutes);

export default app;
