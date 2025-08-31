import "dotenv/config";
import cors from "cors";
import express from "express";
import usuariosRoutes from "./routes/usuariosRoutes.js";
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use("/api/usuarios", usuariosRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Escuchando en puerto ${port}`);
});
