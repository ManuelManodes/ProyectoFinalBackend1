// Importaciones de módulos y utilidades necesarias
import paths from "../utils/paths.js";
import { readJsonFile, writeJsonFile } from "../utils/fileHandler.js";
import { generateId } from "../utils/collectionHandler.js";
import ErrorManager from "./ErrorManager.js";

// Definición de la clase ProductManager para gestionar los productos
export default class ProductManager {

    #jsonFilename;
    #products;


    constructor() {
        this.#jsonFilename = "products.json";
    }

    /**
     * Método privado para encontrar un producto por su ID
     * @param {number|string} id 
     * @returns {object} 
     * @throws {ErrorManager}
     */
    async #findOneById(id) {
        this.#products = await this.getAll(); 
        const productFound = this.#products.find((item) => item.id === Number(id)); 

        if (!productFound) {
            throw new ErrorManager("ID producto no encontrado", 404); 
        }

        return productFound;
    }

    /**
     * Método para obtener todos los productos
     * @param {number} [limit] 
     * @returns {Array}
     * @throws {ErrorManager} 
     */
    async getAll(limit) {
        try {
            this.#products = await readJsonFile(paths.files, this.#jsonFilename); 
            return limit ? this.#products.slice(0, limit) : this.#products;
        } catch (error) {
            throw new ErrorManager("Error al obtener los productos", 500);
        }
    }

    /**
     * Método para obtener un producto específico por su ID
     * @param {number|string} id 
     * @returns {object}
     * @throws {ErrorManager}
     */
    async getOneById(id) {
        try {
            return await this.#findOneById(id); 
        } catch (error) {
            throw new ErrorManager(error.message, error.code); 
        }
    }

    /**
     * Método para insertar un nuevo producto
     * @param {object} data 
     * @param {string} data.title
     * @param {string} data.code 
     * @param {number} data.price 
     * @param {boolean} [data.status=true] 
     * @param {number} data.stock 
     * @param {string} data.category 
     * @param {Array} [data.thumbnails=[]] 
     * @returns {object} 
     * @throws {ErrorManager}
     */
    async insertOne(data) {
        try {
            const { title, description, code, price, status = true, stock, category, thumbnails = [] } = data; 

            if (!title || !description || !code || !price || stock === undefined || !category) {
                throw new ErrorManager("Faltan campos obligatorios", 400);
            }

            // Crea el nuevo producto con un ID único y formatea los datos
            const newProduct = {
                id: generateId(await this.getAll()), 
                title,
                description, 
                code, 
                price: Number(price), 
                status: Boolean(status), 
                stock: Number(stock), 
                category, 
                thumbnails: Array.isArray(thumbnails) ? thumbnails : [], 
            };

            this.#products.push(newProduct);
            await writeJsonFile(paths.files, this.#jsonFilename, this.#products);

            return newProduct; 
        } catch (error) {
            throw new ErrorManager(error.message, error.code); 
        }
    }

    /**
     * Método para actualizar un producto existente por su ID
     * @param {number|string} id 
     * @param {object} data 
     * @returns {object} 
     * @throws {ErrorManager} 
     */
    async updateOneById(id, data) {
        try {
            const productFound = await this.#findOneById(id); 

            const updatedProduct = {
                ...productFound,
                ...data,
                id: productFound.id 
            };

            const index = this.#products.findIndex((item) => item.id === Number(id)); 

            if (index === -1) {
                throw new ErrorManager("Producto no encontrado para actualizar", 404); 
            }

            this.#products[index] = updatedProduct; 
            await writeJsonFile(paths.files, this.#jsonFilename, this.#products); 

            return updatedProduct; 
        } catch (error) {
            throw new ErrorManager(error.message, error.code);
        }
    }

    /**
     * Método para eliminar un producto por su ID
     * @param {number|string} id 
     * @throws {ErrorManager} 
     */
    async deleteOneById(id) {
        try {
            await this.#findOneById(id); 
            this.#products = this.#products.filter((item) => item.id !== Number(id)); 
            await writeJsonFile(paths.files, this.#jsonFilename, this.#products); 
        } catch (error) {
            throw new ErrorManager(error.message, error.code);
        }
    }
}