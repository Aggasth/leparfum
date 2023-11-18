async function cargarTipos() {
    try {
        const response = await fetch('/api/tipos');
        const data = await response.json();
        const tipos = data.tipos;

        const selectTipos = document.getElementById("selectTypes");

        // Limpiar las opciones existentes en el select
        selectTipos.innerHTML = '<option value="" selected disabled hidden>Seleccione un tipo</option>';

        // Iterar sobre los tipos y agregar opciones al select
        tipos.forEach((tipo, index) => {
            const option = document.createElement("option");
            option.value = tipo; // Asignar el valor del tipo
            option.text = tipo; // Asignar el texto del tipo
            selectTipos.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar tipos desde la API:', error);
    }
}


