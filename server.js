import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

// Para Vercel, exportamos la app como handler
export default app;

// Solo iniciamos el servidor si no estamos en Vercel
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(` Servidor corriendo en puerto ${PORT}`);
  });
}
