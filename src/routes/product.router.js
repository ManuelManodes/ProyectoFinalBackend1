// routes/productsRouter.js
import { Router } from "express";
import ProductManager from "../managers/ProductManager.js";

const router = Router();
const productManager = new ProductManager();
const cartId = "64c93f7b5f9d8f2fabc12345"; // Ajustar según tu lógica

// Rutas estáticas
router.get("/view", async (req, res) => {
    try {
        const products = await productManager.getAll(req.query);
        const { message, errorMessage } = req.query;
        res.status(200).render("realTimeProducts", { products, message, errorMessage });
    } catch (error) {
        console.error(error); // Log del error para depuración
        res.status(error.status || 500).json({ status: "error", message: error.message });
    }
});

router.get("/", async (req, res) => {
    try {
        const products = await productManager.getAll(req.query);
        res.status(200).json({ status: "success", payload: products });
    } catch (error) {
        console.error(error); // Log del error para depuración
        res.status(error.status || 500).json({ status: "error", message: error.message });
    }
});

// Ruta HOME antes de definir las rutas con :id
router.get("/home", async (req, res) => {
    try {
        const { message, errorMessage } = req.query;
        let { page = 1, limit = 10 } = req.query;

        page = parseInt(page, 10);
        limit = parseInt(limit, 10);

        if (isNaN(page) || page < 1) page = 1;
        if (isNaN(limit) || limit < 1) limit = 10;

        const products = await productManager.getAll({ page, limit }); 
        // Asegúrate de que productManager.getAll maneje estos parámetros

        res.render("home", { products, cartId, message, errorMessage });
    } catch (error) {
        console.error(error); // Log del error para depuración
        res.status(500).render("error", { message: "Error al obtener productos." });
    }
});

// Rutas con :id
router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id; 
        const product = await productManager.getOneById(id);
        res.status(200).json({ status: "success", payload: product });
    } catch (error) {
        console.error(error); // Log del error para depuración
        res.status(error.status || 500).json({ status: "error", message: error.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const productData = req.body;
        productData.status = productData.status === "on";
        await productManager.insertOne(productData);
        res.redirect("/api/products/view?message=" + encodeURIComponent("Producto creado exitosamente."));
    } catch (error) {
        console.error(error); // Log del error para depuración
        res.redirect("/api/products/view?errorMessage=" + encodeURIComponent("Hubo un error al crear el producto."));
    }
});

router.put("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const updatedProduct = await productManager.updateOneById(id, req.body);
        res.status(200).json({ status: "success", payload: updatedProduct });
    } catch (error) {
        console.error(error); // Log del error para depuración
        res.status(error.status || 500).json({ status: "error", message: error.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const result = await productManager.deleteOneById(id);
        res.status(200).json({ status: "success", payload: result });
    } catch (error) {
        console.error(error); // Log del error para depuración
        res.status(error.status || 500).json({ status: "error", message: error.message });
    }
});

router.get("/:id/edit", async (req, res) => {
    try {
        const { id } = req.params;
        const product = await productManager.getOneById(id); 
        res.render("editProduct", { product });
    } catch (error) {
        console.error(error); // Log del error para depuración
        res.status(error.status || 500).json({ status: "error", message: error.message });
    }
});

router.post("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        data.status = data.status === "on";
        await productManager.updateOneById(id, data);
        res.redirect("/api/products/view?message=" + encodeURIComponent("Producto actualizado exitosamente."));
    } catch (error) {
        console.error(error); // Log del error para depuración
        res.redirect("/api/products/view?errorMessage=" + encodeURIComponent("Hubo un error al actualizar el producto."));
    }
});

export default router;
