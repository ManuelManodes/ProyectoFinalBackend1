import { Router } from "express"; 
import ProductManager from "../managers/ProductManager.js"; 

const router = Router();
const productManager = new ProductManager();

router.get("/", async (req, res) => {
    try {
        const { limit } = req.query; 
        const products = await productManager.getAll(limit); 
        res.status(200).json({ status: "success", payload: products }); 
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

router.get("/:pid", async (req, res) => {
    try {
        const product = await productManager.getOneById(req.params.pid); 
        res.status(200).json({ status: "success", payload: product }); 
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const newProduct = await productManager.insertOne(req.body); 
        res.status(201).json({ status: "success", payload: newProduct }); 
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});


router.put("/:pid", async (req, res) => {
    try {
        const updatedProduct = await productManager.updateOneById(req.params.pid, req.body); 
        res.status(200).json({ status: "success", payload: updatedProduct }); 
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});


router.delete("/:pid", async (req, res) => {
    try {
        await productManager.deleteOneById(req.params.pid); 
        res.status(200).json({ status: "success" }); 
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

export default router;
