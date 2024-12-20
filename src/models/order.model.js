// order.model.js

import mongoose, { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

// Definición del subdocumento para cada ítem en sku_list
const skuItemSchema = new Schema(
    {
        sku: {
            type: String, // Tipo String para coincidir con 'code' de productos
            required: [true, "El SKU es obligatorio"],
            trim: true,
            uppercase: true // Para asegurar la consistencia en mayúsculas
        },
        quantity: {
            type: Number,
            required: [true, "La cantidad es obligatoria"],
            min: [1, "La cantidad debe ser al menos 1"]
        }
    },
    { _id: false } // Evita crear un _id para cada subdocumento
);

// Definición del esquema para las órdenes
const orderSchema = new Schema(
    {
        id: {
            type: Number,
            required: [true, "El ID es obligatorio"],
            unique: true,
            min: [1, "El ID debe ser un número positivo"]
        },
        sku_list: {
            type: [skuItemSchema],
            required: [true, "La lista de SKU es obligatoria"],
            validate: {
                validator: function (v) {
                    return Array.isArray(v) && v.length > 0;
                },
                message: "La lista de SKU debe contener al menos un ítem"
            }
        },
        cliente: {
            type: String,
            required: [true, "El cliente es obligatorio"],
            trim: true,
            minlength: [3, "El nombre del cliente debe tener al menos 3 caracteres"],
            maxlength: [100, "El nombre del cliente debe tener como máximo 100 caracteres"]
        },
        fecha_pedido: {
            type: Date,
            required: [true, "La fecha del pedido es obligatoria"]
        }
    },
    {
        timestamps: true, // Añade createdAt y updatedAt automáticamente
        versionKey: false // Elimina el campo __v
    }
);

// Agrega mongoose-paginate-v2 para habilitar las funcionalidades de paginación
orderSchema.plugin(mongoosePaginate);

// Pre-save hook para validar que cada SKU existe en la colección de productos
orderSchema.pre("save", async function (next) {
    const order = this; // Referencia a la instancia de la orden

    try {
        // Itera sobre cada ítem en sku_list
        for (const item of order.sku_list) {
            const skuCode = item.sku.trim().toUpperCase(); // Asegura el formato correcto

            // Busca el producto correspondiente al SKU utilizando el campo 'code'
            const product = await mongoose.model("products").findOne({ code: skuCode });

            // Si el producto no existe, retorna un error
            if (!product) {
                console.error(`SKU no encontrado: ${skuCode}`);
                return next(new Error(`El SKU '${item.sku}' no existe en el catálogo de productos.`));
            }

            // Verifica si hay suficiente stock para el pedido
            if (product.stock < item.quantity) {
                console.error(`Stock insuficiente para SKU: ${skuCode}. Stock disponible: ${product.stock}`);
                return next(new Error(`No hay suficiente stock para el SKU '${item.sku}'. Stock disponible: ${product.stock}.`));
            }
        }

        // Si todas las validaciones pasan, continúa con el guardado
        next();
    } catch (err) {
        // En caso de error durante la validación, pasa el error al manejador de errores
        console.error(`Error en pre-save hook: ${err.message}`);
        next(err);
    }
});

// Post-save hook para actualizar el stock de los productos después de crear una orden
orderSchema.post("save", async function (order, next) {
    try {
        // Itera sobre cada ítem en sku_list para actualizar el stock
        for (const item of order.sku_list) {
            const skuCode = item.sku.trim().toUpperCase(); // Asegura el formato correcto

            // Actualiza el stock del producto restando la cantidad pedida
            const updateResult = await mongoose.model("products").updateOne(
                { code: skuCode },
                { $inc: { stock: -item.quantity } }
            );

            // Verifica si la actualización fue exitosa
            if (updateResult.nModified === 0) {
                console.error(`No se pudo actualizar el stock para el SKU: ${skuCode}`);
                // Opcional: Puedes manejar este caso según tus necesidades
            }
        }

        // Continúa con el flujo
        next();
    } catch (err) {
        // En caso de error durante la actualización del stock, pasa el error al manejador de errores
        console.error(`Error en post-save hook: ${err.message}`);
        next(err);
    }
});

// Crear el modelo de Mongoose para las órdenes
const OrderModel = model("orders", orderSchema);

// Exportar el modelo para su uso en otras partes de la aplicación
export default OrderModel;
