// Genera un nuevo ID incrementando el ID máximo actual en 1
export const generateId = (collection) => {
    console.log(collection);

    if (!Array.isArray(collection)) {
        throw new Error("Colección no válida");
    }

    let maxId = 0;
    collection.forEach((item) => {
        if (item.id > maxId) {
            maxId = item.id;
        }
    });

    return maxId + 1;
};
