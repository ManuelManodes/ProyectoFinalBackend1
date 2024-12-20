import ErrorManager from "./ErrorManager.js";
import { isValidID } from "../config/mongoose.config.js";
import OrderModel from "../models/order.model.js";
import ProductModel from "../models/product.model.js";

export default class OrderManager {
    #order;
    #product;

    constructor() {
        this.#order = OrderModel;
        this.#product = ProductModel;
    }

    // Busca una orden por su 'id' (no por _id de Mongoose)
    async #findOneById(id) {
        if (!isValidID(id)) {
            throw new ErrorManager("ID inválido", 400);
        }

        const orderFound = await this.#order.findOne({ id: id });

        if (!orderFound) {
            throw new ErrorManager("Orden no encontrada", 404);
        }

        return orderFound;
    }

    // Valida que todos los SKUs en sku_list existan en ProductModel y tengan stock suficiente
    async #validateSkuList(sku_list) {
        for (const item of sku_list) {
            const skuCode = item.sku.trim().toUpperCase(); // Asegura la consistencia
            const product = await this.#product.findOne({ code: skuCode });
            if (!product) {
                throw new ErrorManager(`SKU ${item.sku} no existe`, 400);
            }
            if (product.stock < item.quantity) {
                throw new ErrorManager(`Stock insuficiente para SKU ${item.sku}`, 400);
            }
        }
    }
    

    // Obtiene una lista de órdenes aplicando una serie de filtros opcionales
    async getAll(params) {
        try {
            const { page = 1, limit = 10, ...filters } = params;
            const query = {};

            if (filters.cliente) {
                query.cliente = { $regex: filters.cliente, $options: 'i' }; // Búsqueda insensible a mayúsculas
            }

            if (filters.fecha_pedido) {
                const fecha = new Date(filters.fecha_pedido);
                if (isNaN(fecha)) {
                    throw new ErrorManager("Fecha de pedido inválida", 400);
                }
                // Filtrar por fecha exacta (sin tiempo)
                const start = new Date(fecha.setHours(0,0,0,0));
                const end = new Date(fecha.setHours(23,59,59,999));
                query.fecha_pedido = { $gte: start, $lte: end };
            }

            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { createdAt: -1 },
            };

            return await this.#order.paginate(query, options);
        } catch (error) {
            throw ErrorManager.handleError(error);
        }
    }

    // Obtiene una orden específica por su 'id'
    async getOneById(id) {
        try {
            return await this.#findOneById(id);
        } catch (error) {
            throw ErrorManager.handleError(error);
        }
    }

    // Inserta una nueva orden
    async insertOne(data) {
        try {
            // Validar unicidad del 'id'
            const existingOrder = await this.#order.findOne({ id: data.id });
            if (existingOrder) {
                throw new ErrorManager("El ID de la orden ya existe", 400);
            }

            // Validar existencia y stock de SKUs
            await this.#validateSkuList(data.sku_list);

            // Actualizar stock de productos
            for (const item of data.sku_list) {
                const skuCode = item.sku.trim().toUpperCase(); // Asegura la consistencia
                await this.#product.findOneAndUpdate(
                    { code: skuCode },
                    { $inc: { stock: -item.quantity } },
                    { new: true }
                );
            }


            const order = await this.#order.create(data);
            return order;
        } catch (error) {
            throw ErrorManager.handleError(error);
        }
    }

    // Actualiza una orden existente por su 'id'
    async updateOneById(id, data) {
        try {
            const orderFound = await this.#findOneById(id);

            // Si se actualiza sku_list, es necesario ajustar el stock
            if (data.sku_list) {
                // Restaurar stock de la sku_list existente
                for (const item of orderFound.sku_list) {
                    const skuCode = item.sku.trim().toUpperCase(); // Asegura la consistencia
                    await this.#product.findOneAndUpdate(
                        { code: skuCode },
                        { $inc: { stock: item.quantity } },
                        { new: true }
                    );
                }

                // Validar nueva sku_list
                await this.#validateSkuList(data.sku_list);

                // Actualizar stock con la nueva sku_list
                for (const item of data.sku_list) {
                    const skuCode = item.sku.trim().toUpperCase(); // Asegura la consistencia
                    await this.#product.findOneAndUpdate(
                        { code: skuCode },
                        { $inc: { stock: -item.quantity } },
                        { new: true }
                    );
                }
            }

            const updatedOrder = await this.#order.findOneAndUpdate({ id: id }, data, { new: true, runValidators: true });
            return updatedOrder;
        } catch (error) {
            throw ErrorManager.handleError(error);
        }
    }

    // Elimina una orden por su 'id' y restaura el stock de los productos
    async deleteOneById(id) {
        try {
            const order = await this.#findOneById(id);

            // Restaurar stock de productos
            // Restaurar stock de productos
            for (const item of order.sku_list) {
                const skuCode = item.sku.trim().toUpperCase(); // Asegura la consistencia
                await this.#product.findOneAndUpdate(
                    { code: skuCode },
                    { $inc: { stock: item.quantity } },
                    { new: true }
                );
            }   



            await order.deleteOne();
            return { message: "Orden eliminada exitosamente" };
        } catch (error) {
            throw ErrorManager.handleError(error);
        }
    }
}
