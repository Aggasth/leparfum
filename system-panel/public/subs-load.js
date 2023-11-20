let listUser = [];
async function cargarSuscritos() {
    try {
      const response = await fetch('/api/usuarios');
      const data = await response.json();
      const usuarios = data.usuarios;
      const suscripciones = data.suscripciones;
      const subsTable = document.getElementById("subsTable");

      usuarios.forEach((usuario, index) => {
        const suscripcionUsuario = suscripciones.find(sub => sub.idUser === usuario._id);
  
        if (suscripcionUsuario && suscripcionUsuario.idUser) {
            listUser.push(usuario)
            const row = subsTable.insertRow();

            const nombreCell = row.insertCell(0);
            nombreCell.textContent = usuario.name;
            const direccionCell = row.insertCell(1);
            direccionCell.textContent = usuario.direccion;
            const contactCell = row.insertCell(2);
            contactCell.textContent = usuario.celular;
            const suscripcionCell = row.insertCell(3);

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

        }
      });
      // Se cargan los usuarios suscritos al spinner
      const selectContainer = document.getElementById("selectUser");

      // Limpia el contenido previo del select
      selectContainer.innerHTML = '';
      const initialOption = document.createElement("option");
      initialOption.value = "";
      initialOption.text = "Seleccione un cliente";
      selectContainer.appendChild(initialOption);
      listUser.forEach((usuario, index) => {
          // Crea un nuevo elemento option en cada iteración
          const option = document.createElement("option");
          option.value = usuario._id;
          option.textContent = usuario.name;

          // Agrega el nuevo elemento option al contenedor select
          selectContainer.appendChild(option);
      });
    } catch (error) {
      console.error('Error al cargar los usuarios desde la API:', error);
    }
  }

  document.getElementById('selectUser').addEventListener('change', (event) => {
    const selectedUserId = event.target.value;

    const selectedUser = listUser.find(user => user._id === selectedUserId);

    if (selectedUser) {
        document.getElementById('lastDate').value = obtenerUltimaEntrega(selectedUser); // Reemplaza obtenerUltimaEntrega con la lógica adecuada
        document.getElementById('productList').innerHTML = obtenerProductos(); // Reemplaza obtenerProductos con la lógica adecuada
        document.getElementById('subscriptionInfo').value = obtenerInformacionSuscripcion(selectedUser); // Reemplaza obtenerInformacionSuscripcion con la lógica adecuada
        }
    });

    function obtenerUltimaEntrega(usuario) {
        return 'Fecha de última entrega';
    }

    function obtenerProductos() {
        //Rellenar con array de productos segun sus preferencias.
        return '<option value="1">Producto 1</option><option value="2">Producto 2</option>';
    }

    function obtenerInformacionSuscripcion(usuario) {
        return 'Información de suscripción';
    }
  
  window.addEventListener("load", cargarSuscritos);