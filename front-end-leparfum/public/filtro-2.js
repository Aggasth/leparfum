// Función para cargar tipos desde la API
async function cargarTipos() {
  try {
    const response = await fetch('/api/tipos');
    const data = await response.json();
    const tipos = data.tipos;

    const tipoContainer = document.getElementById("tipoContainer");

    tipos.forEach((tipo, index) => {
      const checkbox = document.createElement("div");
      checkbox.classList.add("form-check", "ms-3");

      checkbox.innerHTML = `
        <input class="form-check-input filtro-checkbox" type="checkbox" id="${tipo}">
        <label class="form-check-label" for="${tipo}">
          ${tipo}
        </label>
      `;

      tipoContainer.appendChild(checkbox);
    });
  } catch (error) {
    console.error('Error al cargar tipos desde la API:', error);
  }
}

// Función para cargar marcas desde la API
async function cargarMarcas() {
  try {
    const response = await fetch('/api/marcas');
    const data = await response.json();
    const marcas = data.marcas;

    const marcaContainer = document.getElementById("marcaContainer");

    marcas.forEach((marca, index) => {
      const checkbox = document.createElement("div");
      checkbox.classList.add("form-check", "ms-3");

      checkbox.innerHTML = `
        <input class="form-check-input filtro-checkbox" type="checkbox" id="${marca}">
        <label class="form-check-label" for="${marca}">
          ${marca}
        </label>
      `;

      marcaContainer.appendChild(checkbox);
    });
  } catch (error) {
    console.error('Error al cargar tipos desde la API:', error);
  }
}

// Estructura de un objeto perfume (puedes ajustarla según tus datos)
class Perfume {
  constructor(id, nombre, tipo, marca) {
    this.id = id;
    this.nombre = nombre;
    this.tipo = tipo;
    this.marca = marca;
  }
}

// Lista de perfumes (simulación de tus datos)
const listaPerfumes = [
  new Perfume(1, 'Perfume 1', 'Floral', 'Marca A'),
  new Perfume(2, 'Perfume 2', 'Cítrico', 'Marca B'),
  // Agrega más perfumes según tu estructura de datos
];

// Función para filtrar perfumes según tipos y marcas
async function filtrarPerfumes(tiposSeleccionados, marcasSeleccionadas) {
  // Filtra la lista de perfumes según los tipos y marcas seleccionados
  const resultadosFiltrados = listaPerfumes.filter(perfume => {
    return (
      (tiposSeleccionados.length === 0 || tiposSeleccionados.includes(perfume.tipo)) &&
      (marcasSeleccionadas.length === 0 || marcasSeleccionadas.includes(perfume.marca))
    );
  });

  // Simula una llamada al servidor o cualquier otra lógica necesaria
  // Aquí podrías realizar una solicitud HTTP para obtener datos filtrados del servidor

  return resultadosFiltrados;
}


// Función para aplicar filtros
async function aplicarFiltros() {
  console.log('Función aplicarFiltros llamada.');  // Agrega esta línea

  console.log('Aplicando filtros...');
  try {
    // Obtenie checkboxs seleccionados de tipos
    const tiposSeleccionados = Array.from(document.querySelectorAll('#tipoContainer input:checked')).map(checkbox => checkbox.id);

    // Obtenie todos los checkboxs seleccionados de marcas
    const marcasSeleccionadas = Array.from(document.querySelectorAll('#marcaContainer input:checked')).map(checkbox => checkbox.id);

    // Aquí puedes realizar la lógica para filtrar los perfumes según los tipos y marcas seleccionados
    // Por ejemplo, podrías enviar estos datos a tu servidor para obtener los resultados filtrados
    const resultadosFiltrados = await filtrarPerfumes(tiposSeleccionados, marcasSeleccionadas);

    // Luego, actualiza la vista con los resultados filtrados
    // Por ejemplo, limpia la lista actual de perfumes y muestra los nuevos resultados
    limpiarListaPerfumes();
    mostrarResultados(resultadosFiltrados);

    console.log('Tipos seleccionados:', tiposSeleccionados);
    console.log('Marcas seleccionadas:', marcasSeleccionadas);
  } catch (error) {
    console.error('Error al aplicar filtros:', error);
  }
}


// Llama a las funciones para cargar tipos y marcas al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  cargarTipos();
  cargarMarcas();

  const btnAplicarFiltros = document.getElementById("btnAplicarFiltros");
  if (btnAplicarFiltros) {
    btnAplicarFiltros.addEventListener("click", aplicarFiltros);
  } else {
    console.error("No se pudo encontrar el botón con el ID 'btnAplicarFiltros'.");
  }
});




// Llama a las funciones para cargar tipos y marcas al cargar la página
window.addEventListener("load", cargarTipos);
window.addEventListener("load", cargarMarcas);
