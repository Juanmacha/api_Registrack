import express from "express";
import cors from "cors";
import pagoRoutes from "./src/routes/pago.routes.js";
import "./src/config/db.js"; 

const app = express();


app.use(cors());
app.use(express.json());

app.use("/api/pagos", pagoRoutes);


export default app;
