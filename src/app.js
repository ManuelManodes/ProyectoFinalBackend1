import express from "express";
import { config as configHandlebars } from "./config/handlebars.config.js";
import { config as configWebsocket } from "./config/websocket.config.js";
import { connectDB } from "./config/mongoose.config.js";

// Importación de enrutadores
import orderRouter from "./routes/order.router.js";
import skuRouter from "./routes/sku.router.js";
import productRouter from "./routes/product.router.js";
import cartRouter from "./routes/cart.router.js";
import homeViewRouter from "./routes/home.view.router.js";
import studentRoutes from "./routes/students.router.js";

// Se crea una instancia de la aplicación Express
const app = express();

// Conexión con la Base de Datos de MongoDB
connectDB();

// Se define el puerto en el que el servidor escuchará las solicitudes
const PORT = process.env.PORT || 8080;

// Declaración de archivos estáticos desde la carpeta 'public'
app.use("/api/public", express.static("./src/public"));

// Middleware para acceder al contenido de formularios codificados en URL
app.use(express.urlencoded({ extended: true }));

// Middleware para acceder al contenido JSON de las solicitudes
app.use(express.json());

// Configuración del motor de plantillas
configHandlebars(app);

// Declaración de rutas de la API
app.use("/api/orders", orderRouter);
app.use("/api/skus", skuRouter);
app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);
app.use("/api/students", studentRoutes);

// Rutas para vistas
app.use("/", homeViewRouter);

// Control de rutas inexistentes
app.use("*", (req, res) => {
    res.status(404).render("error404", { title: "Error 404" });
});

// Se levanta el servidor oyendo en el puerto definido
const httpServer = app.listen(PORT, () => {
    console.log(`Ejecutándose en http://localhost:${PORT}`);
});

// Configuración del servidor de websocket
configWebsocket(httpServer);
