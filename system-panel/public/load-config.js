async function cargarMarcas() {
    try {
        const selectContainer = document.getElementById("selectBrands");
        const response = await fetch('/api/load-config');
        const data = await response.json();
        const marcas = data.marcas;

        selectContainer.innerHTML = '';
        const initialOption = document.createElement("option");
        initialOption.value = "";
        initialOption.text = "Seleccione una marca";
        selectContainer.appendChild(initialOption);

        marcas.forEach((marca, index) => {
            const option = document.createElement("option");
            option.value = marca.nombre;
            option.textContent = marca.nombre;

            selectContainer.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar tipos desde la API:', error);
    }
}

async function cargarTipos() {
    try {
        const selectContainer = document.getElementById("selectTypes");
        const response = await fetch('/api/load-config');
        const data = await response.json();
        const tipos = data.tipos;

        selectContainer.innerHTML = '';
        const initialOption = document.createElement("option");
        initialOption.value = "";
        initialOption.text = "Seleccione un tipo";
        selectContainer.appendChild(initialOption);

        tipos.forEach((tipo, index) => {
            const option = document.createElement("option");
            option.value = tipo.tipo;
            option.textContent = tipo.tipo;

            selectContainer.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar tipos desde la API:', error);
    }
}

window.addEventListener("load", cargarTipos);
window.addEventListener("load", cargarMarcas);


