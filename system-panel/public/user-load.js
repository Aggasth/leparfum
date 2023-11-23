async function cargarUsuarios() {
  try {
      const response = await fetch('/api/usuarios');
      const data = await response.json();
      const usuarios = data.usuarios;
      const suscripciones = data.suscripciones;

      const userTable = document.getElementById("userTable");

      usuarios.forEach((usuario, index) => {
          const row = userTable.insertRow();

          const nombreCell = row.insertCell(0);
          nombreCell.textContent = usuario.name;
          const emailCell = row.insertCell(1);
          emailCell.textContent = usuario.email;
          const contactCell = row.insertCell(2);
          contactCell.textContent = usuario.celular;
          const addressCell = row.insertCell(3);
          addressCell.textContent = usuario.direccion;
          const suscripcionCell = row.insertCell(4);

          const suscripcionUsuario = suscripciones.find(sub => sub.idUser === usuario._id);

          if (suscripcionUsuario && suscripcionUsuario.idUser) {
              suscripcionCell.innerHTML = `
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="green" class="bi bi-check-circle-fill" viewBox="0 0 16 16">
                      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                  </svg>
              `;
          } else {
              suscripcionCell.innerHTML = `
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="red" class="bi bi-x-circle-fill" viewBox="0 0 16 16">
                      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
                  </svg>
              `;
          }
      });

      
      const descargarPDF = () => {
        const pdf = new jsPDF();
        pdf.autoTable({ html: '#userTable' });
        pdf.save('usuarios.pdf');
    };

    // Verifica si ya existe el botón antes de crearlo
    const existingButton = document.getElementById("descargarPDF");
    if (!existingButton) {
        const botonDescargar = document.createElement("button");
        botonDescargar.textContent = "Descargar como PDF";
        botonDescargar.id = "descargarPDF";
        botonDescargar.addEventListener("click", descargarPDF);

        // Encuentra el contenedor adecuado para el botón y colócalo después de la tabla
        const container = document.querySelector('.table-container .col-12');
        container.appendChild(botonDescargar);
    }
  } catch (error) {
      console.error('Error al cargar los usuarios desde la API:', error);
  }
}

window.addEventListener("load", cargarUsuarios);
