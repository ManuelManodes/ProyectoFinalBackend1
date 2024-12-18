const productsList = document.getElementById("products-list");
const btnRefreshProductsList = document.getElementById("btn-refresh-products-list");

const loadProductsList = async () => {
    try {

        const response = await fetch("/api/products", { method: "GET" });
        const data = await response.json();
        const products = data.payload || [];
        productsList.innerText = "";
        
        products.forEach(product => {
            productsList.innerHTML += `<li>Id: ${product.id} - Nombre: ${product.title}</li>`;
        });

    } catch (error) {

        console.error("Error al cargar la lista de productos:", error);
        productsList.innerText = "Error al cargar los productos.";
    }
};


btnRefreshProductsList.addEventListener("click", () => {
    loadProductsList(); 
    console.log("Lista actualizada...");
});

loadProductsList();
