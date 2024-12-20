import { Router } from "express";
import OrderManager from "../managers/OrderManager.js";

const router = Router();
const orderManager = new OrderManager();

// Ruta para obtener todas las órdenes
router.get("/", async (req, res) => {
    try {
        const orders = await orderManager.getAll(req.query);
        res.status(200).json({ status: "success", payload: orders });
    } catch (error) {
        res.status(error.status || 500).json({ status: "error", message: error.message });
    }
});

// Ruta para obtener una orden por su ID
router.get("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const order = await orderManager.getOneById(id);
        res.status(200).json({ status: "success", payload: order });
    } catch (error) {
        res.status(error.status || 500).json({ status: "error", message: error.message });
    }
});

// Ruta para crear una nueva orden
router.post("/", async (req, res) => {
    try {
        const order = await orderManager.insertOne(req.body);
        res.status(201).json({ status: "success", payload: order });
    } catch (error) {
        res.status(error.status || 500).json({ status: "error", message: error.message });
    }
});

// Ruta para actualizar una orden por su ID
router.put("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const updatedOrder = await orderManager.updateOneById(id, req.body);
        res.status(200).json({ status: "success", payload: updatedOrder });
    } catch (error) {
        res.status(error.status || 500).json({ status: "error", message: error.message });
    }
});

// Ruta para eliminar una orden por su ID
router.delete("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const result = await orderManager.deleteOneById(id);
        res.status(200).json({ status: "success", payload: result });
    } catch (error) {
        res.status(error.status || 500).json({ status: "error", message: error.message });
    }
});

export default router;
