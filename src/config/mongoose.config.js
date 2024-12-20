import mongoose from "mongoose";
const { connect, connection, Types } = mongoose;

export const connectDB = async () => {
    const URL = "mongodb+srv://manuelmanodescofre:Manodes3000@clusterproyectofinalman.f0jes.mongodb.net/ClusterProyectoFinalManuelManodes";
    try {
        await connect(URL);
        console.log("Conectado a MongoDB");
    } catch (error) {
        console.error("Error al conectar con MongoDB", error.message);
        process.exit(1); // Salir del proceso si falla la conexión
    }
};

// Escuchar eventos de la conexión
connection.on("error", (err) => console.error("Error de conexión a MongoDB:", err.message));

// Exportar la función isValidID
export const isValidID = (id) => Types.ObjectId.isValid(id);
