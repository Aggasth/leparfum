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
      const radio = document.createElement("div");
      radio.classList.add("form-check", "ms-3");

      radio.innerHTML = `
        <input class="form-check-input filtro-radio" type="radio" name="marca" id="${marca}">
        <label class="form-check-label" for="${marca}">
          ${marca}
        </label>
      `;

      marcaContainer.appendChild(radio);
    });
  } catch (error) {
    console.error('Error al cargar tipos desde la API:', error);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  cargarTipos();
  cargarMarcas();

  // Agregar un evento al formulario para capturar las selecciones antes de enviar
  const form = document.querySelector('form');
  form.addEventListener('submit', function (event) {
    // Obtener las selecciones de tags
    const tipoContainer = document.getElementById("tipoContainer");
    const selectedTags = [...tipoContainer.querySelectorAll('.filtro-checkbox:checked')].map(checkbox => checkbox.id);
    
    // Obtener la selección de marca
    const marcaContainer = document.getElementById("marcaContainer");
    const selectedBrand = marcaContainer.querySelector('.filtro-radio:checked')?.id || '';

    // Actualizar los campos del formulario con las selecciones
    document.getElementById('tagsProduct').value = selectedTags.join(',');
    document.getElementById('brandProduct').value = selectedBrand;
  });
});
