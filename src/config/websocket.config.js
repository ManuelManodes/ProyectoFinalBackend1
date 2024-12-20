import { Server } from "socket.io";
import ProductManager from "../managers/ProductManager.js";

const productManager = new ProductManager();

export const config = (httpServer) => {
    const socketServer = new Server(httpServer);

    socketServer.on("connection", async (socket) => {
        console.log("Nuevo cliente conectado");

        socket.emit("products-list", { products: await productManager.getAll() });

        socket.on("insert-product", async (data) => {
            try {
                console.log("Datos recibidos para inserción:", data);
                const newProduct = await productManager.insertOne(data);

                socketServer.emit("product-added", newProduct);
                socketServer.emit("products-list", { products: await productManager.getAll() });
            } catch (error) {
                console.error("Error al agregar producto:", error.message);
                socket.emit("error-message", { message: error.message });
            }
        });

        socket.on("delete-product", async (data) => {
            try {
                await productManager.deleteOneById(data.id);
                socketServer.emit("delete-product", { products: await productManager.getAll() });
            } catch (error) {
                socket.emit("error-message", { message: error.message });
            }
        });

        socket.on("disconnect", () => {
            console.log("Se desconecto un cliente");
        });
    });
};
