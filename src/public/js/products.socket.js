// public/js/products.socket.js

document.addEventListener("DOMContentLoaded", () => {
    const socket = io();

    // Selección de elementos del DOM
    const productsTableBody = document.querySelector("#products-table tbody");
    const productsForm = document.getElementById("products-form");
    const errorMessage = document.getElementById("error-message"); 
    const deleteErrorMessage = document.getElementById("delete-error-message");
    const inputProductId = document.getElementById("input-product-id");
    const btnDeleteProduct = document.getElementById("btn-delete-product");

    // Elementos del modal de confirmación
    const confirmDeleteModal = document.getElementById("confirm-delete-modal");
    const confirmDeleteYes = document.getElementById("confirm-delete-yes");
    const confirmDeleteNo = document.getElementById("confirm-delete-no");

    let productIdToDelete = null; 

    const openModal = () => {
        confirmDeleteModal.style.display = "block";
        confirmDeleteYes.focus();
    };

    const closeModal = () => {
        confirmDeleteModal.style.display = "none";
        btnDeleteProduct.focus();
    };


    productsForm.addEventListener("submit", (event) => {
        event.preventDefault();
        console.log("Formulario de productos enviado");
        const formData = new FormData(productsForm);

        // Limpia mensajes anteriores
        if (errorMessage) {
            errorMessage.innerText = "";
            errorMessage.style.color = "";
        }

        // Validación de campos
        const title = formData.get("title").trim();
        const description = formData.get("description").trim();
        const code = formData.get("code").trim();
        const price = parseFloat(formData.get("price"));
        const stock = parseInt(formData.get("stock"), 10);
        const category = formData.get("category").trim();
        const status = document.getElementById("status").checked;

        if (!title || !description || !code || isNaN(price) || isNaN(stock) || !category) {
            errorMessage.innerText = "Por favor, completa todos los campos correctamente.";
            errorMessage.style.color = "red";
            return;
        }

        // Envía los datos al servidor
        socket.emit("insert-product", {
            title,
            description,
            code,
            price,
            stock,
            category,
            status,
        });

        console.log("Evento 'insert-product' emitido");
    });


    socket.on("product-inserted", (newProduct) => {
        if (errorMessage) {
            errorMessage.innerText = "Producto agregado correctamente.";
            errorMessage.style.color = "green";
        }

        const fragment = document.createDocumentFragment();
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${newProduct.id}</td>
            <td>${newProduct.title}</td>
            <td>${newProduct.description}</td>
            <td>${newProduct.code}</td>
            <td>${newProduct.price}</td>
            <td>${newProduct.stock}</td>
            <td>${newProduct.category}</td>
            <td>${newProduct.status ? 'Activo' : 'Inactivo'}</td>
        `;

        fragment.appendChild(row);
        productsTableBody.appendChild(fragment);


        productsForm.reset();
    });

    btnDeleteProduct.addEventListener("click", () => {
        const id = inputProductId.value.trim();
        if (errorMessage) {
            errorMessage.innerText = "";
            errorMessage.style.color = "";
        }
        if (deleteErrorMessage) {
            deleteErrorMessage.innerText = "";
            deleteErrorMessage.style.color = "";
        }

        if (id && parseInt(id, 10) > 0) {
            productIdToDelete = id; 
            openModal(); 
        } else {
            if (deleteErrorMessage) {
                deleteErrorMessage.innerText = "Por favor, ingresa un ID válido.";
                deleteErrorMessage.style.color = "red";
            }
        }
    });


    confirmDeleteYes.addEventListener("click", () => {
        if (productIdToDelete) {
            socket.emit("delete-product", { id: productIdToDelete });

            inputProductId.value = "";
            productIdToDelete = null;
            closeModal();
        }
    });

    confirmDeleteNo.addEventListener("click", () => {
        productIdToDelete = null;
        closeModal(); 
    });

    window.addEventListener("click", (event) => {
        if (event.target === confirmDeleteModal) {
            productIdToDelete = null;
            closeModal();
        }
    });

    socket.on("product-deleted", (deletedProductId) => {
        if (deleteErrorMessage) {
            deleteErrorMessage.innerText = "Producto eliminado correctamente.";
            deleteErrorMessage.style.color = "green";
        }

        const rowToDelete = Array.from(productsTableBody.rows).find(
            row => row.cells[0].textContent == deletedProductId
        );
        if (rowToDelete) {
            productsTableBody.removeChild(rowToDelete);
        }
    });

    socket.on("error-message", (data) => {
        if (data.context === "insert") {
            if (errorMessage) {
                errorMessage.innerText = data.message;
                errorMessage.style.color = "red";
            }
        } else if (data.context === "delete") {
            if (deleteErrorMessage) {
                deleteErrorMessage.innerText = data.message;
                deleteErrorMessage.style.color = "red";
            }
        } else {
            console.log("Recibido error general. Contexto:", data.context);

            if (errorMessage) {
                errorMessage.innerText = data.message;
                errorMessage.style.color = "red";
            }
            if (deleteErrorMessage) {
                deleteErrorMessage.innerText = data.message;
                deleteErrorMessage.style.color = "red";
            }
        }
    });

    socket.on("initialProducts", (products) => {
        productsTableBody.innerHTML = "";

        const fragment = document.createDocumentFragment();

        products.forEach((product) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.title}</td>
                <td>${product.description}</td>
                <td>${product.code}</td>
                <td>${product.price}</td>
                <td>${product.stock}</td>
                <td>${product.category}</td>
                <td>${product.status ? 'Activo' : 'Inactivo'}</td>
            `;
            fragment.appendChild(row);
        });

        productsTableBody.appendChild(fragment);
    });


    socket.on("products-list", (data) => {
        const products = data.products || [];
        productsTableBody.innerHTML = "";

        const fragment = document.createDocumentFragment();

        products.forEach((product) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.title}</td>
                <td>${product.description}</td>
                <td>${product.code}</td>
                <td>${product.price}</td>
                <td>${product.stock}</td>
                <td>${product.category}</td>
                <td>${product.status ? 'Activo' : 'Inactivo'}</td>
            `;

            fragment.appendChild(row);
        });

        productsTableBody.appendChild(fragment);
    });
});
