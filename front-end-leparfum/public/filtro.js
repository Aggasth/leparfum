// Define los tipos predefinidos
const tiposPredefinidos = ["Tipo 1", "Tipo 2", "Tipo 3", "Tipo 4"];

// Función para generar los checkboxes
function generarTipos() {
  const tipoContainer = document.getElementById("tipoContainer");

  tiposPredefinidos.forEach((tipo, index) => {
    const checkbox = document.createElement("div");
    checkbox.classList.add("form-check", "ms-3");

    checkbox.innerHTML = `
      <input class="form-check-input" type="checkbox" id="tipo${index}">
      <label class="form-check-label" for="tipo${index}">
        ${tipo}
      </label>
    `;

    tipoContainer.appendChild(checkbox);
  });
}

// Llama a la función para generar los tipos al cargar la página
window.addEventListener("load", generarTipos);
