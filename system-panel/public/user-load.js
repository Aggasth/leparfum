async function cargarUsuarios() {
    try {
        const response = await fetch('/api/usuarios');
        const data = await response.json();
        const usuarios = data.usuarios;

        const userTable = document.getElementById("userTable");

        usuarios.forEach((usuario, index) => {
            const row = userTable.insertRow();

            const nombreCell = row.insertCell(0);
            nombreCell.textContent = usuario.name; // Cambiado a 'name'
            const emailCell = row.insertCell(1);
            emailCell.textContent = usuario.email;
            const contactCell = row.insertCell(2);
            contactCell.textContent = usuario.celular;
            const addressCell = row.insertCell(3);
            addressCell.textContent = usuario.direccion;
            const suscripcionCell = row.insertCell(4);

            // Verificar si 'usuario.suscrito' está definido antes de acceder a 'active'
            if (usuario.suscrito && usuario.suscrito.active === true) {
                suscripcionCell.innerHTML = '<i class="bi bi-check-lg"></i>';
            } if(usuario.suscrito && usuario.suscrito.active === false) {
                suscripcionCell.innerHTML = '<i class="bi bi-x-lg"></i>';
            } else{
                suscripcionCell.textContent = 'No suscrito';
            }
        });

    } catch (error) {
        console.error('Error al cargar los usuarios desde la API:', error);
    }
}

window.addEventListener("load", cargarUsuarios);
