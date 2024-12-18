export default class ErrorManager extends Error {
    /**
     * Constructor de la clase ErrorManager
     * @param {string} message
     * @param {number} [code=500] 
     */
    constructor(message, code) {
        super(message); 
        this.code = code || 500;
    }
}
