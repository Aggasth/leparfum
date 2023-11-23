// filtro-2.js
document.addEventListener("DOMContentLoaded", function() {
  // Obtén los contenedores de los filtros
  const marcaContainer = document.getElementById('marcaContainer');
  const tipoContainer = document.getElementById('tipoContainer');
  
  // Llama a la función cargarFiltros para obtener y mostrar las opciones de filtro
  cargarFiltros();

  // Agrega un evento al botón "Aplicar Filtros"
  const btnAplicarFiltros = document.getElementById('btnAplicarFiltros');
  btnAplicarFiltros.addEventListener('click', aplicarFiltros);
  
  // Función para cargar las opciones de filtro desde la API
  async function cargarFiltros() {
    try {
      // Obtén marcas desde la API
      const marcasResponse = await fetch('/api/marcas');
      const marcasData = await marcasResponse.json();
      const marcas = marcasData.marcas;

      // Renderiza las opciones de marca
      renderizarFiltros(marcas, marcaContainer);

      // Obtén tipos desde la API
      const tiposResponse = await fetch('/api/tipos');
      const tiposData = await tiposResponse.json();
      const tipos = tiposData.tipos;

      // Renderiza las opciones de tipo
      renderizarFiltros(tipos, tipoContainer);
    } catch (error) {
      console.error('Error al cargar filtros desde la API:', error);
    }
  }

  // Función para renderizar opciones de filtro
  function renderizarFiltros(opciones, contenedor) {
    opciones.forEach((opcion) => {
      const checkbox = document.createElement('div');
      checkbox.classList.add('form-check', 'ms-3');
      checkbox.innerHTML = `
        <input class="form-check-input filtro-checkbox" type="checkbox" id="${opcion}">
        <label class="form-check-label" for="${opcion}">
          ${opcion}
        </label>
      `;
      contenedor.appendChild(checkbox);
    });
  }

  // Función para cargar productos iniciales
  async function cargarProductos() {
  try {
    const response = await fetch('/api/productos');
    const data = await response.json();
    consultaActual = {}; // Resetea la consulta actual
    console.log('Productos cargados inicialmente:', data.productos);
    actualizarVistaProductos(data.productos);
  } catch (error) {
    console.error('Error al cargar productos:', error);
  }
}

  // Función para aplicar los filtros seleccionados
  async function aplicarFiltros() {
    // Obtén las marcas seleccionadas
    const marcasSeleccionadas = obtenerFiltrosSeleccionados(marcaContainer);
    console.log('Marcas seleccionadas:', marcasSeleccionadas);

    // Obtén los tipos seleccionados
    const tiposSeleccionados = obtenerFiltrosSeleccionados(tipoContainer);
    console.log('Tipos seleccionados:', tiposSeleccionados);

    try {
      const data = await obtenerProductosFiltrados(marcasSeleccionadas, tiposSeleccionados);
      console.log('Respuesta del servidor:', data);
      if (data && typeof data.productos !== 'undefined') {
        console.log('Productos filtrados:', data.productos);
        consultaActual = {}; // Resetea la consulta actual
        actualizarVistaProductos(data.productos);
      } else {
        console.error('La respuesta del servidor no contiene la propiedad "productos" o es undefined.', data);
      }
    } catch (error) {
      console.error('Error al obtener productos filtrados:', error);
    }
  }
  
  
  

  // Función para obtener los filtros seleccionados
  function obtenerFiltrosSeleccionados(contenedor) {
    const checkboxes = contenedor.querySelectorAll('.filtro-checkbox');
    const seleccionados = Array.from(checkboxes)
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.id);
    return seleccionados;
  }

  // Función para actualizar la vista con productos filtrados
function actualizarVistaProductos(productos) {
  try {
    // Obtén el contenedor donde deseas mostrar los productos en el DOM
    const contenedorProductos = document.getElementById('contenedorProductos');

    // Limpia el contenido actual del contenedor
    contenedorProductos.innerHTML = '';

    // Verifica si hay productos para mostrar
    if (productos && productos.length > 0) {
      // Crea un elemento div con la clase 'row'
      const rowElement = document.createElement('div');
      rowElement.classList.add('row');

      // Itera sobre los productos y crea elementos para mostrarlos
      productos.forEach((producto) => {
        const productoElement = document.createElement('div');
        productoElement.classList.add('col-lg-3', 'col-md-6', 'col-sm-6', 'mb-4'); // Añade clases Bootstrap para la disposición
        productoElement.innerHTML = `
          <div class="card card-product border-0">
            <a href="/template-product/${producto._id}">
              <img class="img img-product" src="${producto.imagen}" alt="${producto.nombre}">
            </a>
            <div class="card-header fw-bold" style="color: rgb(131, 103, 103)">
              $${producto.precio}
            </div>
            <div class="card-body">
              <p class="card-text">
                ${producto.nombreProducto}
              </p>
            </div>
          </div>
        `;
        rowElement.appendChild(productoElement);
      });

      // Agrega el elemento 'row' al contenedor principal
      contenedorProductos.appendChild(rowElement);
    } else {
      // Muestra un mensaje indicando que no hay productos disponibles
      const mensaje = document.createElement('p');
      mensaje.textContent = 'No hay productos disponibles con los filtros seleccionados.';
      contenedorProductos.appendChild(mensaje);
    }
  } catch (error) {
    console.error('Error al actualizar la vista de productos:', error);
  }
}



 // Función para obtener productos filtrados desde el servidor
async function obtenerProductosFiltrados(marcasSeleccionadas, tiposSeleccionados) {
  try {
    const response = await fetch('/api/productos-filtrados', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        marcasSeleccionadas,
        tiposSeleccionados,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

});
