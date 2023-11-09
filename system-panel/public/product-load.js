async function cargarProductos() {
    try {
        const response = await fetch('/api/productos');
        const data = await response.json();
        const productos = data.productos;

        const productTable = document.getElementById("productTable");

        productos.forEach((producto, index) => {
            const row = productTable.insertRow(); // Crea una nueva fila en la tabla

            // Añade celdas a la fila para cada propiedad de producto que deseas mostrar
            const nombreCell = row.insertCell(0);
            nombreCell.textContent = producto.nombreProducto; // Suponiendo que 'nombre' es una propiedad del producto
            const precioCell = row.insertCell(1);
            precioCell.textContent = `$${producto.precio.toFixed(2)}`; // Suponiendo que 'precio' es una propiedad numérica
            const marcaCell = row.insertCell(2);
            marcaCell.textContent = producto.marca;
            const tagsCell = row.insertCell(3);
            tagsCell.textContent = producto.tags.join(', ');
            // Puedes continuar agregando más celdas para otras propiedades del producto
        });
    } catch (error) {
        console.error('Error al cargar productos desde la API:', error);
    }
}

// Llama a la función para cargar productos al cargar la página
window.addEventListener("load", cargarProductos);
