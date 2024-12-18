document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("cliente-form"); // Referencia al formulario del cliente.
  const guardarCambiosBtn = document.getElementById("guardar-cambios"); // Botón para guardar cambios.

  // Función para verificar y confirmar si hay una sesión activa del cliente.
  const confirmarSesion = async () => {
      try {
          // Realiza una solicitud GET al servidor para verificar la sesión.
          const response = await fetch("https://localhost:3000/api/clientes/cliente-check-session", {
              method: "GET",
              credentials: "include", // Asegura que se envíen las cookies de sesión.
          });

          if (!response.ok) {
              throw new Error("No se pudo verificar la sesión activa.");
          }

          const sessionData = await response.json();

          if (sessionData.session && sessionData.session.role === "cliente") {
              // Si la sesión es válida, guarda el ID del cliente en localStorage.
              localStorage.setItem("id_cliente", sessionData.session.id);
              return sessionData.session.id;
          } else {
              // Si no es cliente o no tiene permisos, redirige al login.
              alert("No tienes permisos para acceder a esta sección.");
              window.location.href = "login.html";
          }
      } catch (error) {
          console.error("Error al verificar la sesión:", error);
          alert("Error al verificar la sesión. Por favor, inicia sesión nuevamente.");
          window.location.href = "login.html";
          return null; // Retorna null en caso de error.
      }
  };

  // Función para cargar los datos del cliente en el formulario.
  const cargarDatos = async (idCliente) => {
      try {
          // Realiza una solicitud GET para obtener los datos del cliente.
          const response = await fetch(`https://localhost:3000/api/clientes/${idCliente}`, {
              method: "GET",
              credentials: "include", // Asegura que las cookies de sesión se envíen.
          });

          if (!response.ok) {
              throw new Error("No se pudieron cargar los datos del cliente.");
          }

          const cliente = await response.json();

          // Llena los campos del formulario con los datos obtenidos.
          document.getElementById("nombre").value = cliente.nombre || "";
          document.getElementById("apellido").value = cliente.apellido || "";
          document.getElementById("rut").value = cliente.rut || "";
          document.getElementById("email").value = cliente.email || "";
          document.getElementById("telefono").value = cliente.telefono || "";
      } catch (error) {
          console.error("Error al cargar los datos del cliente:", error);
          alert("Error al cargar los datos del cliente.");
      }
  };

  // Evento para guardar los cambios en el perfil del cliente.
  guardarCambiosBtn.addEventListener("click", async (event) => {
      event.preventDefault(); // Previene la recarga de la página.
      const nombre = document.getElementById("nombre").value;
      const apellido = document.getElementById("apellido").value;
      const rut = document.getElementById("rut").value;
      const email = document.getElementById("email").value;
      const telefono = document.getElementById("telefono").value;
      const passwordConfirm = document.getElementById("password-confirm").value; // Contraseña actual para confirmar.

      const idCliente = localStorage.getItem("id_cliente"); // Recupera el ID del cliente.

      if (!idCliente) {
          alert("Error: No se encontró el ID del cliente. Por favor, inicia sesión nuevamente.");
          window.location.href = "login.html";
          return;
      }

      try {
          // Realiza una solicitud PUT para actualizar los datos del cliente.
          const response = await fetch(`https://localhost:3000/api/clientes/${idCliente}`, {
              method: "PUT",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify({
                  nombre,
                  apellido,
                  rut,
                  email,
                  telefono,
                  passwordConfirm,
              }),
              credentials: "include", // Asegura que las cookies de sesión se envíen.
          });

          if (!response.ok) {
              const errorData = await response.json();
              alert(`Error al actualizar el perfil: ${errorData.error}`);
              return;
          }

          alert("Perfil actualizado exitosamente.");
          form.reset(); // Limpia el formulario.
          cargarDatos(idCliente); // Recarga los datos del cliente.
      } catch (error) {
          console.error("Error al guardar cambios:", error);
          alert("Error al actualizar el perfil.");
      }
  });

  // Función inmediata para inicializar el formulario.
  (async () => {
      const idCliente = await confirmarSesion(); // Verifica la sesión y obtiene el ID del cliente.
      if (idCliente) {
          cargarDatos(idCliente); // Carga los datos del cliente si hay sesión activa.
      }
  })();

  // Evento para cambiar la contraseña.
  document.getElementById("form-cambiar-contrasena").addEventListener("submit", async (e) => {
      e.preventDefault(); // Previene la recarga de la página.

      const contrasenaActual = document.getElementById("contrasena-actual").value;
      const nuevaContrasena = document.getElementById("nueva-contrasena").value;
      const repetirContrasena = document.getElementById("repetir-contrasena").value;

      // Validación de la nueva contraseña.
      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[^\s]{8,}$/;
      if (!regex.test(nuevaContrasena)) {
          alert(
              "La nueva contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y un carácter especial, sin espacios."
          );
          return;
      }

      if (nuevaContrasena !== repetirContrasena) {
          alert("Las contraseñas nuevas no coinciden.");
          return;
      }

      try {
          // Realiza una solicitud PUT para cambiar la contraseña.
          const response = await fetch("https://localhost:3000/api/clientes/cambiar-contrasena", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              credentials: "include", // Asegura que las cookies de sesión se envíen.
              body: JSON.stringify({ contrasenaActual, nuevaContrasena, repetirContrasena }),
          });

          if (response.ok) {
              alert("Contraseña cambiada exitosamente.");
              document.getElementById("form-cambiar-contrasena").reset(); // Limpia el formulario.
          } else {
              const error = await response.json();
              alert(error.error); // Muestra el error del backend.
          }
      } catch (error) {
          console.error("Error al cambiar la contraseña:", error);
          alert("Hubo un error en el servidor. Intenta nuevamente.");
      }
  });
});
