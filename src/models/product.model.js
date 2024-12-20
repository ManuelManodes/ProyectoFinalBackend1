// product.model.js

import { Schema, model } from "mongoose";
import paginate from "mongoose-paginate-v2";

// Definición del esquema para los productos
const productSchema = new Schema({
    // Identificador interno de Mongoose (_id) se usa automáticamente
    // Si deseas mantener un campo 'id' separado, puedes incluirlo así:
    id: {
        type: String, // Cambiado de Number a String
        required: [true, "El ID es obligatorio"],
        unique: true,
        trim: true
    },
    title: {
        index: { name: "idx_title" },
        type: String,
        required: [true, "El título es obligatorio"],
        uppercase: true,
        trim: true,
        minLength: [3, "El título debe tener al menos 3 caracteres"],
        maxLength: [100, "El título debe tener como máximo 100 caracteres"],
    },
    description: {
        type: String,
        required: [true, "La descripción es obligatoria"],
        trim: true,
        minLength: [10, "La descripción debe tener al menos 10 caracteres"],
        maxLength: [1000, "La descripción debe tener como máximo 1000 caracteres"],
    },
    code: {
        type: String,
        required: [true, "El código es obligatorio"],
        unique: true,
        trim: true,
        uppercase: true,
        minLength: [3, "El código debe tener al menos 3 caracteres"],
        maxLength: [20, "El código debe tener como máximo 20 caracteres"],
    },
    price: {
        type: Number,
        required: [true, "El precio es obligatorio"],
        min: [0, "El precio debe ser un valor positivo"],
    },
    status: {
        type: Boolean,
        required: [true, "El estado es obligatorio"],
        default: true,
    },
    stock: {
        type: Number,
        required: [true, "El stock es obligatorio"],
        min: [0, "El stock debe ser un valor positivo"],
    },
    category: {
        type: String,
        required: [true, "La categoría es obligatoria"],
        trim: true,
        uppercase: true,
        minLength: [3, "La categoría debe tener al menos 3 caracteres"],
        maxLength: [50, "La categoría debe tener como máximo 50 caracteres"],
    },
    thumbnails: {
        type: [String],
        default: [],
        validate: {
            validator: function(v) {
                return Array.isArray(v);
            },
            message: "Las miniaturas deben ser un arreglo de URLs válidas"
        }
    },
}, {
    timestamps: true, // Añade createdAt y updatedAt automáticamente
    versionKey: false, // Elimina el campo __v
});

// Agregar validación para cada URL en thumbnails (opcional)
productSchema.path('thumbnails').validate((thumbnails) => {
    return thumbnails.every(url => {
        // Simple regex para validar URLs, puedes ajustar según tus necesidades
        const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
        return urlRegex.test(url);
    });
}, 'Todas las miniaturas deben ser URLs válidas');

// Agrega mongoose-paginate-v2 para habilitar las funcionalidades de paginación
productSchema.plugin(paginate);

// Crear el modelo de Mongoose para los productos
const ProductModel = model("products", productSchema);

export default ProductModel;
