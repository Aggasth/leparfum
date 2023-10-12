// Define los tipos predefinidos
const tiposPredefinidos = ["Citrico", "Dulce", "Frutales", "Madera", "Casual", "Romance", "Pino"];
const marcasPredefinidas = ["BOSS", "Calvin Klein", "Victoria Secret", "Tommy Hilfiger", "Saint Lauren", "Dior", "Chanel"];

// Función para generar los checkboxes
function generarTipos() {
  const tipoContainer = document.getElementById("tipoContainer");

  tiposPredefinidos.forEach((tipo, index) => {
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
}
function generarMarcas() {
  const tipoContainer = document.getElementById("marcaContainer");

  marcasPredefinidas.forEach((marca, index) => {
    const checkbox = document.createElement("div");
    checkbox.classList.add("form-check", "ms-3");

    checkbox.innerHTML = `
      <input class="form-check-input filtro-checkbox" type="checkbox" id="${marca}">
      <label class="form-check-label" for="${marca}">
        ${marca}
      </label>
    `;

    tipoContainer.appendChild(checkbox);
  });
}

// Llama a la función para generar los tipos al cargar la página
window.addEventListener("load", generarTipos);
window.addEventListener("load", generarMarcas);
