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


// Llama a las funciones para cargar tipos y marcas al cargar la página
window.addEventListener("load", cargarTipos);
window.addEventListener("load", cargarMarcas);
