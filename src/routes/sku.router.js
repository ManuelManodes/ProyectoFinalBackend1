import { Router } from "express"; 
import SkuManager from "../managers/SkuManager.js"; 
import uploader from "../utils/uploader.js"; 

// Inicialización del router y del gestor de SKUs
const router = Router();
const skuManager = new SkuManager();

router.get("/", async (req, res) => {
    try {
        const skus = await skuManager.getAll(); 
        res.status(200).json({ status: "success", payload: skus }); 
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const sku = await skuManager.getOneById(req.params.id);
        res.status(200).json({ status: "success", payload: sku }); 
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

router.post("/", uploader.single("file"), async (req, res) => {
    try {
        const sku = await skuManager.insertOne(req.body, req.file); 
        res.status(201).json({ status: "success", payload: sku }); 
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

router.put("/:id", uploader.single("file"), async (req, res) => {
    try {
        const sku = await skuManager.updateOneById(req.params.id, req.body, req.file); 
        res.status(200).json({ status: "success", payload: sku });
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        await skuManager.deleteOneById(req.params.id); 
        res.status(200).json({ status: "success" }); 
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

export default router;
