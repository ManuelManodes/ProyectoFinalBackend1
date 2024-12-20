// Módulo 'path': sirve para trabajar con rutas de archivos y directorios
import path from "path";

// Define la ruta raíz del proyecto
const ROOT_PATH = path.resolve(); // Devuelve la ruta absoluta al directorio actual

// Define la ruta 'src' del proyecto
const SRC_PATH = path.join(ROOT_PATH, "src");

// Define las rutas claves del proyecto
const paths = {
    root: ROOT_PATH, 
    src: SRC_PATH, 
    public: path.join(SRC_PATH, "public"), 
    images: path.join(SRC_PATH, "public", "images"), 
    files: path.join(SRC_PATH, "files"), 
    views: path.join(SRC_PATH, "views"), 

};

export default paths;