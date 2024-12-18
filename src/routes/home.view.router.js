import { Router } from "express";

const router = Router();

// Se utiliza el método HTTP GET para responder a las solicitudes
router.get("/", async (req, res) => {
    try {
        res.render("home", { title: "Inicio" });
    } catch (error) {
        res.status(500).send(`<h1>Error</h1><h3>${error.message}</h3>`);
    }
});

// Define otra ruta para el endpoint "/realTimeProducts"
router.get("/realTimeProducts", async (req, res) => {
    try {
        res.render("realTimeProducts", { title: "Productos en tiempo real" });
    } catch (error) {
        res.status(500).send(`<h1>Error</h1><h3>${error.message}</h3>`);
    }
});

export default router;
