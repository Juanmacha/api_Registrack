import express from "express";
import userRoutes from './src/routes/usuario.routes.js';


const app = express();

app.use(express.json());

app.use("/api/usuario", userRoutes);

app.listen(3000, () => {
  console.log("Servidor escuchando en puerto 3000");
});
