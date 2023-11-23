document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const contactForm = document.querySelector('#updateContactForm');
    const addressForm = document.querySelector('#updateAddressForm'); // Agregamos esta línea

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Realiza alguna validación adicional si es necesario

        try {
            // Envía la solicitud al servidor usando fetch o XMLHttpRequest
            const response = await fetch('/update-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre: form.nombre.value,
                    contraseña: form.contraseña.value,
                    newPass: form.newPass.value,
                    newPass2: form.newPass2.value,
                }),
            });

            // Maneja la respuesta del servidor (puede ser un redireccionamiento o un mensaje de éxito/error)
            const result = await response.json();

            if (response.ok) {
                // Si la respuesta es exitosa, cierra el modal o realiza alguna acción adicional
                document.getElementById('generalModal').classList.remove('show');
                document.body.classList.remove('modal-open');
                document.body.style.paddingRight = '0';
            } else {
                // Si hay errores, muestra los mensajes de error en el formulario
                const errorMessage = result.errors.map(error => error.msg).join('<br>');
                document.getElementById('error-message').innerHTML = errorMessage;
                document.getElementById('error-message').style.display = 'block';
            }

        } catch (error) {
            console.error('Error al enviar el formulario:', error);
        }
    });

    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Realiza alguna validación adicional si es necesario

        try {
            // Envía la solicitud al servidor usando fetch o XMLHttpRequest
            const response = await fetch('/update-contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    celular: contactForm.celular.value,
                }),
            });

            // Maneja la respuesta del servidor (puede ser un redireccionamiento o un mensaje de éxito/error)
            const result = await response.json();

            if (response.ok) {
                // Si la respuesta es exitosa, cierra el modal o realiza alguna acción adicional
                document.getElementById('contactoModal').classList.remove('show');
                document.body.classList.remove('modal-open');
                document.body.style.paddingRight = '0';
            } else {
                // Si hay errores, muestra los mensajes de error en el formulario
                const errorMessage = result.errors.map(error => error.msg).join('<br>');
                document.getElementById('contact-error-message').innerHTML = errorMessage;
                document.getElementById('contact-error-message').style.display = 'block';
            }

        } catch (error) {
            console.error('Error al enviar el formulario:', error);
        }
    });

    // Agregamos el bloque para la actualización de direcciones
    addressForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Realiza alguna validación adicional si es necesario

        try {
            // Envía la solicitud al servidor usando fetch o XMLHttpRequest
            const response = await fetch('/update-address', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    direccion: addressForm.direccion.value,
                }),
            });

            // Maneja la respuesta del servidor (puede ser un redireccionamiento o un mensaje de éxito/error)
            const result = await response.json();

            if (response.ok) {
                // Si la respuesta es exitosa, cierra el modal o realiza alguna acción adicional
                document.getElementById('direccionesModal').classList.remove('show');
                document.body.classList.remove('modal-open');
                document.body.style.paddingRight = '0';
            } else {
                // Si hay errores, muestra los mensajes de error en el formulario
                const errorMessage = result.errors.map(error => error.msg).join('<br>');
                document.getElementById('address-error-message').innerHTML = errorMessage;
                document.getElementById('address-error-message').style.display = 'block';
            }

        } catch (error) {
            console.error('Error al enviar el formulario:', error);
        }
    });
<<<<<<< HEAD
});
=======
});
>>>>>>> bb47f7448ca4b51343a5f367b8d2c24b93db7eec
