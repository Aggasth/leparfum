async function cargarCarrito() {
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

async function actualizarCarrito() {
    try{
        const response = await fetch('/api/update-cart');
        const data = await response.json();
    }catch(error){

    }
}