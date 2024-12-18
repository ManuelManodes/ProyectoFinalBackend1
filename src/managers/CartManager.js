import paths from "../utils/paths.js";
import { readJsonFile, writeJsonFile } from "../utils/fileHandler.js";
import { generateId } from "../utils/collectionHandler.js";
import ErrorManager from "./ErrorManager.js";
import ProductManager from "./ProductManager.js"; 

export default class CartManager {
    #jsonFilename;
    #carts;

    constructor() {
        this.#jsonFilename = "carts.json";
    }

    /**
     * Método privado para encontrar un carrito por su ID
     * @param {number|string} id 
     * @returns {object}
     * @throws {ErrorManager} 
     */
    async #findOneById(id) {
        this.#carts = await this.getAll(); 
        const cartFound = this.#carts.find((item) => item.id === Number(id)); 
        if (!cartFound) {
            throw new ErrorManager("Carrito no encontrado", 404); 
        }
        return cartFound; 
    }

    /**
     * Método para obtener todos los carritos
     * @returns {Array} 
     * @throws {ErrorManager}
     */
    async getAll() {
        try {
            this.#carts = await readJsonFile(paths.files, this.#jsonFilename); 
            return this.#carts;
        } catch (error) {
            throw new ErrorManager("Error al obtener los carritos", 500);
        }
    }

    /**
     * Método para obtener un carrito específico por su ID
     * @param {number|string} id 
     * @returns {object}
     * @throws {ErrorManager}
     */
    async getCartById(id) {
        try {
            return await this.#findOneById(id);
        } catch (error) {
            throw new ErrorManager(error.message, error.code);
        }
    }

    /**
     * Método para crear un nuevo carrito
     * @returns {object}
     * @throws {ErrorManager}
     */
    async createCart() {
        try {
            const newCart = {
                id: generateId(await this.getAll()), 
                products: [],
            };

            this.#carts.push(newCart);
            await writeJsonFile(paths.files, this.#jsonFilename, this.#carts);

            return newCart;
        } catch (error) {
            throw new ErrorManager(error.message, error.code);
        }
    }

    /**
     * Método para agregar un producto a un carrito específico
     * @param {number|string} cartId - ID del carrito
     * @param {number|string} productId - ID del producto a agregar
     * @returns {object} - Carrito actualizado
     * @throws {ErrorManager} - Si el producto no existe o hay otro error
     */
    async addProductToCart(cartId, productId) {
        try {
            const productExists = await new ProductManager().getOneById(productId);
            if (!productExists) {
                throw new ErrorManager("Producto no encontrado", 404);
            }

            const cartFound = await this.#findOneById(cartId);
            const productIndex = cartFound.products.findIndex((item) => item.product === productId);

            if (productIndex >= 0) {
                cartFound.products[productIndex].quantity += 1;
            } else {
                cartFound.products.push({ product: productId, quantity: 1 });
            }

            const index = this.#carts.findIndex((item) => item.id === Number(cartId));
            this.#carts[index] = cartFound;

            await writeJsonFile(paths.files, this.#jsonFilename, this.#carts);

            return cartFound;
        } catch (error) {
            throw new ErrorManager(error.message, error.code);
        }
    }
}
