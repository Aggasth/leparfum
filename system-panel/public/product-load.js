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
        tagsCell.textContent = producto.tipo.join(', ');
        
        // Crea una celda para el botón de editar
        const editarCell = row.insertCell(4);
        const editarButton = document.createElement("button");
        editarButton.className = "btn btn-warning";
        editarButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pen-fill" viewBox="0 0 16 16">
                <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001z"/>
            </svg>
        `;


        function cargarDatosEnModal(producto) {
          let descripcion = document.getElementById('descProductModal');
          descripcion.value = producto.descripcion;
          let stock = document.getElementById('stockProductModal');
          stock.value = producto.cantidad;
          
          document.getElementById('idProductModal').value = producto._id;
          document.getElementById('nameProductModal').value = producto.nombreProducto;
          document.getElementById('imgProductModal').value = producto.imagen;
          document.getElementById('sizeProductModal').value = producto.tamaño;
          document.getElementById('priceProductModal').value = producto.precio;
          document.getElementById('sexSelectModal').value = producto.sexo;
        }

        editarButton.setAttribute("data-bs-toggle", "modal");
        editarButton.setAttribute("data-bs-target", "#editarModal");
        editarButton.addEventListener("click", async () => {
          try {
             const response = await fetch(`/api/product-edit/${producto._id}`);
             const data = await response.json();
       
             if (response.ok) {
                cargarDatosEnModal(data.producto);
                $('#editarModal').modal('show');
             } else {
                console.error('Error al obtener datos del producto para editar:', data.error);
             }
          } catch (error) {
             console.error('Error de red:', error);
          }
       });
       
        editarCell.appendChild(editarButton);

        // Crea una celda para el botón de eliminar
        const eliminarCell = row.insertCell(5);
        const eliminarButton = document.createElement("button");
        eliminarButton.className = "btn btn-danger";
        eliminarButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">
                <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"/>
            </svg>
        `;
        eliminarButton.addEventListener("click", async () => {
          // Lógica para manejar la eliminación, por ejemplo, confirmar y luego enviar una solicitud de eliminación
          console.log(`Eliminar producto con ID ${producto._id}`);
        });
        eliminarCell.appendChild(eliminarButton);
      });
    } catch (error) {
      console.error('Error al cargar productos desde la API:', error);
    }
  }
  
  // Llama a la función para cargar productos al cargar la página
  window.addEventListener("load", cargarProductos);
  