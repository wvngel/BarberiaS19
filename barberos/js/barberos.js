document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("barbero-form"); // Referencia al formulario del perfil del barbero.
  const guardarCambiosBtn = document.getElementById("guardar-cambios"); // Botón para guardar cambios.

  // Verificar y confirmar sesión activa del barbero
  const confirmarSesion = async () => {
    try {
      const response = await fetch("https://localhost:3000/api/barberos/check-session", {
        method: "GET",
        credentials: "include", // Incluye las cookies de sesión para verificar si hay un usuario autenticado.
      });

      if (!response.ok) {
        throw new Error("No se pudo verificar la sesión activa."); // Si no se pudo verificar, lanza un error.
      }

      const sessionData = await response.json();

      if (sessionData.session && sessionData.session.role === "barbero") {
        // Si el rol es "barbero", guarda el ID en el almacenamiento local y retorna el ID.
        localStorage.setItem("id_barbero", sessionData.session.id);
        return sessionData.session.id;
      } else {
        alert("No tienes permisos para acceder a esta sección."); // Si no es un barbero, muestra alerta.
      }
    } catch (error) {
      console.error("Error al verificar la sesión:", error); // Log del error en consola.
      alert("Error al verificar la sesión. Por favor, inicia sesión nuevamente.");
      window.location.href = "login.html"; // Redirige al login si hay un problema.
      return null;
    }
  };

  // Cargar los datos del barbero en el formulario
  const cargarDatos = async (idBarbero) => {
    try {
      const response = await fetch(`https://localhost:3000/api/barberos/${idBarbero}`, {
        method: "GET",
        credentials: "include", // Asegura que las cookies de sesión se envíen.
      });

      if (!response.ok) {
        throw new Error("No se pudieron cargar los datos del barbero."); // Lanza un error si no se pudo obtener la información.
      }

      const barbero = await response.json();

      // Completa los campos del formulario con los datos del barbero.
      document.getElementById("nombre").value = barbero.nombre || "";
      document.getElementById("apellido").value = barbero.apellido || "";
      document.getElementById("email").value = barbero.email || "";
      document.getElementById("telefono").value = barbero.telefono || "";
      document.getElementById("especialidad").value = barbero.especialidad || "";
    } catch (error) {
      console.error("Error al cargar los datos del barbero:", error);
      alert("Error al cargar los datos del barbero.");
    }
  };

  // Guardar los cambios en el perfil del barbero
  guardarCambiosBtn.addEventListener("click", async (event) => {
    event.preventDefault(); // Prevenir el comportamiento predeterminado del botón.
    const nombre = document.getElementById("nombre").value;
    const apellido = document.getElementById("apellido").value;
    const telefono = document.getElementById("telefono").value;
    const especialidad = document.getElementById("especialidad").value;
    const passwordConfirm = document.getElementById("password-confirm").value;

    const idBarbero = localStorage.getItem("id_barbero");

    if (!idBarbero) {
      alert("Error: No se encontró el ID del barbero. Por favor, inicia sesión nuevamente.");
      window.location.href = "login.html"; // Redirige al login si no se encuentra el ID.
      return;
    }

    try {
      const response = await fetch(`https://localhost:3000/api/barberos/${idBarbero}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
          apellido,
          telefono,
          especialidad,
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
      cargarDatos(idBarbero); // Recarga los datos actualizados.
    } catch (error) {
      console.error("Error al guardar cambios:", error);
      alert("Error al actualizar el perfil.");
    }
  });

  // Inicializar el flujo de carga
  confirmarSesion().then((idBarbero) => {
    if (idBarbero) {
      cargarDatos(idBarbero); // Cargar datos si hay un barbero autenticado.
    }
  });

  // Función para cerrar sesión
  async function cerrarSesionBarbero() {
    try {
      const response = await fetch('https://localhost:3000/api/barberos/logout', {
        method: 'POST',
        credentials: 'include', // Incluir cookies para la sesión.
      });

      if (response.ok) {
        alert("Sesión cerrada exitosamente");
        window.location.href = "index.html"; // Redirige a la página principal tras cerrar sesión.
      } else {
        const errorData = await response.json();
        console.error("Error al cerrar sesión:", errorData.error);
        alert("Hubo un problema al cerrar la sesión.");
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("Error en el servidor al intentar cerrar sesión.");
    }
  }

  // Evento para manejar el envío del formulario de cambio de contraseña
  document.getElementById("form-cambiar-contrasena").addEventListener("submit", async (e) => {
    e.preventDefault();

    const contrasenaActual = document.getElementById("contrasena-actual").value;
    const nuevaContrasena = document.getElementById("nueva-contrasena").value;
    const repetirContrasena = document.getElementById("repetir-contrasena").value;

    // Validar la nueva contraseña con una expresión regular.
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[^\s]{8,}$/;
    if (!regex.test(nuevaContrasena)) {
      alert("La nueva contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y un carácter especial, sin espacios.");
      return;
    }

    if (nuevaContrasena !== repetirContrasena) {
      alert("Las contraseñas nuevas no coinciden.");
      return;
    }

    try {
      const response = await fetch("https://localhost:3000/api/barberos/cambiar-contrasena", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ contrasenaActual, nuevaContrasena, repetirContrasena }),
      });

      if (response.ok) {
        alert("Contraseña cambiada exitosamente.");
        document.getElementById("form-cambiar-contrasena").reset(); // Limpia el formulario.
      } else {
        const error = await response.json();
        alert(error.error); // Muestra el error proporcionado por el backend.
      }
    } catch (error) {
      console.error("Error al cambiar la contraseña:", error);
      alert("Hubo un error en el servidor. Intenta nuevamente.");
    }
  });
});
