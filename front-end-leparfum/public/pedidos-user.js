async function cargarVentas() {
    try {
      const response = await fetch('/api/sales');
      const data = await response.json();
      const sales = data.sales;
  
      const salesTable = document.getElementById("salesTable");
  
      sales.forEach((sale, index) => {
        const row = salesTable.insertRow();

  
        // Mostrar los productos del carrito
        const cartCell = row.insertCell(0);
        const productos = sale.productos.map(producto => `${producto.nombre} (${producto.cantidad})`).join(', ');
        cartCell.textContent = productos;
  
        // Mostrar el total de la compra
        const totalCell = row.insertCell(1);
        totalCell.textContent = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'CLP' }).format(sale.totalCompra);
  
        // Mostrar la fecha
        const dateCell = row.insertCell(2);
        dateCell.textContent = formatDate(sale.fecha);
      });
    } catch (error) {
      console.error('Error al cargar las ventas desde la API:', error);
    }
  }
  
  function formatDate(dateString) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const formattedDate = new Date(dateString).toLocaleString('es-ES', options);
  
    // Verificar si la fecha es válida
    return formattedDate !== 'Invalid Date' ? formattedDate : 'Fecha no válida';
  }
  
  // Llamar a la función para cargar las ventas al cargar la página
  window.addEventListener("load", cargarVentas);
  