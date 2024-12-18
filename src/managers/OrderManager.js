// Importaciones de módulos y utilidades necesarias
import paths from "../utils/paths.js";
import { readJsonFile, writeJsonFile } from "../utils/fileHandler.js";
import { generateId } from "../utils/collectionHandler.js";
import ErrorManager from "./ErrorManager.js";

export default class OrderManager {
    #jsonFilename;
    #orders;


    constructor() {
        this.#jsonFilename = "orders.json"; 
    }

    /**
     * Método privado para encontrar una orden por su ID
     * @param {number|string} id 
     * @returns {object} 
     * @throws {ErrorManager} 
     */
    async #findOneById(id) {
        this.#orders = await this.getAll(); 
        const orderFound = this.#orders.find((item) => item.id === Number(id)); 

        if (!orderFound) {
            throw new ErrorManager("ID no encontrado", 404); 
        }

        return orderFound;
    }

    /**
     * Método para obtener todas las órdenes
     * @returns {Array} 
     * @throws {ErrorManager} 
     */
    async getAll() {
        try {
            this.#orders = await readJsonFile(paths.files, this.#jsonFilename); 
            return this.#orders; 
        } catch (error) {
            throw new ErrorManager(error.message, error.code); 
        }
    }

    /**
     * Método para obtener una orden específica por su ID
     * @param {number|string} id 
     * @returns {object} 
     * @throws {ErrorManager} 
     */
    async getOneById(id) {
        try {
            const orderFound = await this.#findOneById(id); 
            return orderFound; 
        } catch (error) {
            throw new ErrorManager(error.message, error.code); 
        }
    }

    /**
     * Método para insertar una nueva orden
     * @param {object} data 
     * @param {Array} data.sku_list 
     * @param {string} data.cliente 
     * @param {string} data.fecha_pedido 
     * @returns {object} 
     * @throws {ErrorManager} 
     */
    async insertOne(data) {
        try {
            const { sku_list, cliente, fecha_pedido } = data; 

            // Verifica que todos los datos obligatorios estén presentes
            if (!sku_list || !cliente || !fecha_pedido) {
                throw new ErrorManager("Faltan datos obligatorios", 400); 
            }

            // Crea la nueva orden con un ID único y formatea la lista de SKUs
            const order = {
                id: generateId(await this.getAll()), 
                sku_list: sku_list.map((item) => ({
                    sku: Number(item.sku), 
                    quantity: Number(item.quantity), 
                })),
                cliente, 
                fecha_pedido, 
            };

            this.#orders.push(order); 
            await writeJsonFile(paths.files, this.#jsonFilename, this.#orders); 

            return order; 
        } catch (error) {
            throw new ErrorManager(error.message, error.code); 
        }
    }

    /**
     * Método para agregar un SKU a una orden específica
     * @param {number|string} orderId 
     * @param {number|string} skuId 
     * @param {number} [quantity=1] 
     * @returns {object} 
     * @throws {ErrorManager} 
     */
    async addSkuToOrder(orderId, skuId, quantity = 1) {
        try {
            const orderFound = await this.#findOneById(orderId); 
            const skuIndex = orderFound.sku_list.findIndex((item) => item.sku === Number(skuId)); 

            if (skuIndex >= 0) {
                orderFound.sku_list[skuIndex].quantity += quantity; 
            } else {
                orderFound.sku_list.push({ sku: Number(skuId), quantity }); 
            }

            const index = this.#orders.findIndex((item) => item.id === Number(orderId)); 
            this.#orders[index] = orderFound; 
            await writeJsonFile(paths.files, this.#jsonFilename, this.#orders); 

            return orderFound; 
        } catch (error) {
            throw new ErrorManager(error.message, error.code); 
        }
    }
}
