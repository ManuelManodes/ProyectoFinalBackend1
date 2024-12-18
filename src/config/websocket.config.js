import { Server } from "socket.io";
import ProductManager from "../managers/ProductManager.js";

const productManager = new ProductManager();

// Configuración el servidor Socket.IO
export const config = (httpServer) => {
    // Crea una nueva instancia del servidor Socket.IO
    const socketServer = new Server(httpServer);

    // Escucha el evento de conexión del cliente
    socketServer.on("connection", async (socket) => {
        console.log("Nuevo cliente conectado");

        // Emitir la lista inicial de productos al cliente conectado
        socket.emit("products-list", { products: await productManager.getAll() });

        // Manejar la inserción de un producto
        socket.on("insert-product", async (data) => {
            try {
                // Insertar el nuevo producto
                await productManager.insertOne(data);

                // Emitir la lista actualizada de productos a todos los clientes
                socketServer.emit("products-list", { products: await productManager.getAll() });
            } catch (error) {
                // Emitir un mensaje de error al cliente
                socket.emit("error-message", { message: error.message });
            }
        });

        // Manejar la eliminación de un producto
        socket.on("delete-product", async (data) => {
            try {
                // Eliminar un producto
                await productManager.deleteOneById(data.id);

                // Emitir la lista actualizada de productos a todos los clientes
                socketServer.emit("delete-product", { products: await productManager.getAll() });
            } catch (error) {
                // Emitir un mensaje de error al cliente
                socket.emit("error-message", { message: error.message });
            }
        });
    });
};
