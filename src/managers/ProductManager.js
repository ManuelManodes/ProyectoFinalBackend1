import ErrorManager from "../managers/ErrorManager.js";
import { isValidID } from "../config/mongoose.config.js";
import ProductModel from "../models/product.model.js";

export default class ProductManager {
    #product;

    constructor() {
        this.#product = ProductModel;
    }

    async #findOneById(id) {
        // Verifica que el _id tenga un formato válido de MongoDB
        if (!isValidID(id)) {
            throw new ErrorManager("ID inválido", 400);
        }

        const productFound = await this.#product.findById(id);
        if (!productFound) {
            throw new ErrorManager("Producto no encontrado", 404);
        }

        return productFound;
    }

    async getAll(params = {}) {
        try {
            const { page = 1, limit = 10, ...filters } = params;
            const query = {};

            if (filters.title) {
                query.title = filters.title.toString().toUpperCase();
            }

            if (filters.category) {
                query.category = filters.category.toString().toUpperCase();
            }

            if (typeof filters.status !== 'undefined') {
                query.status = filters.status === 'true';
            }

            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { createdAt: -1 },
                lean: true 
            };

            return await this.#product.paginate(query, options);
        } catch (error) {
            throw ErrorManager.handleError(error);
        }
    }

    async getOneById(id) {
        const productFound = await this.#product.findById(id).lean();
        if (!productFound) {
          throw new ErrorManager("Producto no encontrado", 404);
        }
        return productFound;
      }
      

    async insertOne(data) {
        try {
            // Verificaciones si usas campo code como único
            const existingCode = await this.#product.findOne({ code: data.code });
            if (existingCode) {
                throw new ErrorManager("El código del producto ya existe", 400);
            }

            const product = await this.#product.create(data);
            return product;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async updateOneById(id, data) {
        try {
            // Primero verificamos que el producto exista
            await this.#findOneById(id);

            // Verificar si el code nuevo ya existe en otro producto
            if (data.code) {
                const existingCode = await this.#product.findOne({ code: data.code, _id: { $ne: id } });
                if (existingCode) {
                    throw new ErrorManager("El nuevo código del producto ya existe", 400);
                }
            }

            // Actualización usando findByIdAndUpdate
            const updatedProduct = await this.#product.findByIdAndUpdate(
                id,
                data,
                { new: true, runValidators: true }
            );
            return updatedProduct;
        } catch (error) {
            throw ErrorManager.handleError(error);
        }
    }

    async deleteOneById(id) {
        try {
            const product = await this.#findOneById(id);
            await product.deleteOne();
            return { message: "Producto eliminado exitosamente" };
        } catch (error) {
            throw ErrorManager.handleError(error);
        }
    }
}
