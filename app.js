import "dotenv/config";
import cors from "cors";
import express from "express";
import usuariosRoutes from "./routes/usuariosRoutes.js";
import difuntosRoutes from "./routes/difuntosRoutes.js";
import encargadosRoutes from "./routes/encargadosRoutes.js";
import locacionesRoutes from "./routes/locacionesRoutes.js";
import panteonesRoutes from "./routes/panteonesRoutes.js";
import espaciosRoutes from "./routes/espaciosRoutes.js";
import estadosRoutes from "./routes/estadosRoutes.js";
import transaccionesRoutes from "./routes/transaccionesRoutes.js";
import reportesRoutes from "./routes/reportesRoutes.js";
import deudoresRoutes from "./routes/deudoresRoutes.js";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/usuarios", usuariosRoutes);
app.use("/api/difuntos", difuntosRoutes);
app.use("/api/encargados", encargadosRoutes);
app.use("/api/locaciones", locacionesRoutes);
app.use("/api/panteones", panteonesRoutes);
app.use("/api/espacios", espaciosRoutes);
app.use("/api/estados", estadosRoutes);
app.use("/api/transacciones", transaccionesRoutes);
app.use("/api/reportes", reportesRoutes);
app.use("/api/deudores", deudoresRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Escuchando en puerto ${port}`);
});
