// Verificar sesion del administrador
async function verificarSesionAdmin() {
  try {
    const response = await fetch('https://localhost:3000/api/admin/admin-check-session', {
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      // Si el rol no es admin, redirigir al login
      if (!data.session || data.session.role !== 'admin') {
        redirigirALogin();
      }
    } else {
      // Si no hay sesión, redirigir al login
      redirigirALogin();
    }
  } catch (error) {
    console.error("Error al verificar la sesión:", error);
    redirigirALogin();
  }
}

function redirigirALogin() {
  alert("No tienes permiso para acceder a esta página. Redirigiendo al inicio de sesión...");
  window.location.href = "../../login.html";
}

// Llamar a la función al cargar la página
document.addEventListener("DOMContentLoaded", verificarSesionAdmin);
document.addEventListener("DOMContentLoaded", cargarBarberos);

async function cargarBarberos() {
  try {
    const response = await fetch("https://localhost:3000/api/admin/barberos", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) throw new Error("Error al obtener los barberos");

    const barberos = await response.json();
    const tbody = document.getElementById("barberos-tbody");
    tbody.innerHTML = "";

    barberos.forEach((barbero) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${barbero.id_barbero}</td>
        <td>${barbero.nombre}</td>
        <td>${barbero.apellido}</td>
        <td>${barbero.rut}</td>
        <td>${barbero.email}</td>
        <td>${barbero.telefono}</td>
        <td>${barbero.especialidad}</td>
        <td>
          <button class="btn btn-primary btn-sm editar-barbero" data-id="${barbero.id_barbero}">Editar</button>
          <button class="btn btn-danger btn-sm borrar-barbero" data-id="${barbero.id_barbero}">Borrar</button>
        </td>
      `;
      tbody.appendChild(row);
    });

    agregarEventosBotones();
  } catch (error) {
    console.error("Error al cargar barberos:", error);
  }
}

function agregarEventosBotones() {
  document.querySelectorAll(".editar-barbero").forEach((button) => {
    button.addEventListener("click", (event) => {
      const barberoId = event.target.dataset.id;
      abrirModalEditar(barberoId);
    });
  });

  document.querySelectorAll(".borrar-barbero").forEach((button) => {
    button.addEventListener("click", (event) => {
      const barberoId = event.target.dataset.id;
      borrarBarbero(barberoId);
    });
  });
}

async function abrirModalEditar(id) {
  try {
    const response = await fetch(`https://localhost:3000/api/admin/barberos/${id}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) throw new Error("Error al obtener los datos del barbero");

    const barbero = await response.json();

    // Llenar los campos del formulario con los datos del barbero
    document.getElementById("editarBarberoId").value = barbero.id_barbero;
    document.getElementById("editarNombre").value = barbero.nombre;
    document.getElementById("editarApellido").value = barbero.apellido;
    document.getElementById("editarRut").value = barbero.rut;
    document.getElementById("editarEmail").value = barbero.email;
    document.getElementById("editarTelefono").value = barbero.telefono;
    document.getElementById("editarEspecialidad").value = barbero.especialidad;

    // Mostrar el modal
    const modal = new bootstrap.Modal(document.getElementById("editarBarberoModal"));
    modal.show();
  } catch (error) {
    console.error("Error al abrir el modal de edición:", error);
  }
}

document.getElementById("form-editar-barbero").addEventListener("submit", async (event) => {
  event.preventDefault();

  const id = document.getElementById("editarBarberoId").value;
  const nombre = document.getElementById("editarNombre").value;
  const apellido = document.getElementById("editarApellido").value;
  const rut = document.getElementById("editarRut").value;
  const email = document.getElementById("editarEmail").value;
  const telefono = document.getElementById("editarTelefono").value;
  const especialidad = document.getElementById("editarEspecialidad").value;

  try {
    const response = await fetch(`https://localhost:3000/api/admin/barberos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ nombre, apellido, rut, email, telefono, especialidad }),
    });

    if (!response.ok) throw new Error("Error al actualizar el barbero");

    alert("Barbero actualizado exitosamente");
    const modal = bootstrap.Modal.getInstance(document.getElementById("editarBarberoModal"));
    modal.hide();
    cargarBarberos();
  } catch (error) {
    console.error("Error al guardar los cambios:", error);
  }
});

async function borrarBarbero(id) {
  try {
    const confirmacion = confirm("¿Estás seguro de que deseas borrar este barbero?");
    if (!confirmacion) return;

    const response = await fetch(`https://localhost:3000/api/admin/barberos/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) throw new Error("Error al borrar el barbero");

    alert("Barbero borrado exitosamente.");
    cargarBarberos(); // Actualiza la lista de barberos después de eliminar uno
  } catch (error) {
    console.error("Error al borrar el barbero:", error);
    alert("Ocurrió un error al intentar borrar el barbero.");
  }
}
// Abrir modal de creación
document.getElementById("btn-crear-barbero").addEventListener("click", () => {
  const modal = new bootstrap.Modal(document.getElementById("crearBarberoModal"));
  modal.show();
});

// Lógica para manejar el formulario de creación
document.getElementById("form-crear-barbero").addEventListener("submit", async (event) => {
  event.preventDefault();

  const barberoNombre = document.getElementById("crearNombre").value.trim();
  const barberoApellido = document.getElementById("crearApellido").value.trim();
  const barberoRut = document.getElementById("crearRut").value.trim();
  const barberoDigitoVerificador = document
    .getElementById("crearDigitoVerificador")
    .value.trim()
    .toUpperCase();
  const barberoEmail = document.getElementById("crearEmail").value.trim();
  const barberoTelefono = document.getElementById("crearTelefono").value.trim();
  const barberoEspecialidad = document.getElementById("crearEspecialidad").value.trim();
  const barberoContrasena = document.getElementById("crearContrasena").value;
  const barberoConfirmarContrasena = document.getElementById("crearConfirmarContrasena").value;

  // Validaciones
  if (barberoContrasena !== barberoConfirmarContrasena) {
    alert("Las contraseñas no coinciden.");
    return;
  }

  const validarRutBarbero = (rut, dv) => {
    let suma = 0;
    let multiplicador = 2;

    for (let i = rut.length - 1; i >= 0; i--) {
      suma += parseInt(rut[i]) * multiplicador;
      multiplicador = multiplicador < 7 ? multiplicador + 1 : 2;
    }

    const dvCalculado = 11 - (suma % 11);
    const dvReal = dvCalculado === 11 ? "0" : dvCalculado === 10 ? "K" : dvCalculado.toString();

    return dv === dvReal;
  };

  if (!validarRutBarbero(barberoRut, barberoDigitoVerificador)) {
    alert("El RUT ingresado es inválido.");
    return;
  }

  const datos = {
    barberoNombre,
    barberoApellido,
    barberoEmail,
    barberoTelefono,
    barberoEspecialidad,
    barberoContrasena,
    barberoConfirmarContrasena,
    barberoRut,
    barberoDigitoVerificador,
  };

  try {
    const response = await fetch("https://localhost:3000/api/admin/barberos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Asegúrate de incluir las cookies de sesión
      body: JSON.stringify(datos),
    });

    if (!response.ok) {
      const errorData = await response.json(); // Intenta obtener el mensaje de error del servidor
      throw new Error(errorData.error || "Error al crear barbero");
    }

    alert("Barbero creado exitosamente.");
    document.getElementById("form-crear-barbero").reset();
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("crearBarberoModal")
    );
    modal.hide(); // Cierra el modal después de crear el barbero
    cargarBarberos(); // Actualiza la lista de barberos
  } catch (error) {
    console.error("Error al crear barbero:", error);
    alert(error.message || "Ocurrió un error al intentar crear el barbero.");
  }
});
