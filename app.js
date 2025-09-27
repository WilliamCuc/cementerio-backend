import "dotenv/config";
import cors from "cors";
import express from "express";
import usuariosRoutes from "./routes/usuariosRoutes.js";
import difuntosRoutes from "./routes/difuntosRoutes.js";
import encargadosRoutes from "./routes/encargadosRoutes.js";
import locacionesRoutes from "./routes/locacionesRoutes.js";
import panteonesRoutes from "./routes/panteonesRoutes.js";
import espaciosRoutes from "./routes/espaciosRoutes.js";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use("/api/usuarios", usuariosRoutes);
app.use("/api/difuntos", difuntosRoutes);
app.use("/api/encargados", encargadosRoutes);
app.use("/api/locaciones", locacionesRoutes);
app.use("/api/panteones", panteonesRoutes);
app.use("/api/espacios", espaciosRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Escuchando en puerto ${port}`);
});
