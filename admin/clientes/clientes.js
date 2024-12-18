// Verificar sesion del administrador
async function verificarSesionAdmin() {
  try {
    const response = await fetch('https://localhost:3000/api/admin/admin-check-session', {
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      if (!data.session || data.session.role !== 'admin') {
        redirigirALogin();
      }
    } else {
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
document.addEventListener("DOMContentLoaded", cargarClientes);

async function cargarClientes() {
  try {
    const response = await fetch("https://localhost:3000/api/admin/clientes", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) throw new Error("Error al obtener los clientes");

    const clientes = await response.json();
    const tbody = document.getElementById("clientes-tbody");
    tbody.innerHTML = "";

    clientes.forEach((cliente) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${cliente.id_cliente}</td>
        <td>${cliente.nombre}</td>
        <td>${cliente.apellido}</td>
        <td>${cliente.email}</td>
        <td>${cliente.rut}</td>
        <td>${cliente.telefono}</td>
        <td>
          <button class="btn btn-primary btn-sm editar-cliente" data-id="${cliente.id_cliente}">Editar</button>
          <button class="btn btn-danger btn-sm borrar-cliente" data-id="${cliente.id_cliente}">Borrar</button>
        </td>
      `;
      tbody.appendChild(row);
    });

    agregarEventosBotones();
  } catch (error) {
    console.error("Error al cargar clientes:", error);
  }
}

function agregarEventosBotones() {
  document.querySelectorAll(".editar-cliente").forEach((button) => {
    button.addEventListener("click", (event) => {
      const clienteId = event.target.dataset.id;
      abrirModalEditar(clienteId);
    });
  });

  document.querySelectorAll(".borrar-cliente").forEach((button) => {
    button.addEventListener("click", (event) => {
      const clienteId = event.target.dataset.id;
      borrarCliente(clienteId);
    });
  });
}

async function borrarCliente(id) {
  try {
    const confirmacion = confirm("¿Estás seguro de que deseas borrar este cliente?");
    if (!confirmacion) return;

    const response = await fetch(`https://localhost:3000/api/admin/clientes/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) throw new Error("Error al borrar el cliente");

    alert("Cliente borrado exitosamente.");
    cargarClientes(); // Actualizar la lista de clientes después de borrar
  } catch (error) {
    console.error("Error al borrar el cliente:", error);
    alert("Ocurrió un error al intentar borrar el cliente.");
  }
}

async function abrirModalEditar(id) {
  try {
    const response = await fetch(`https://localhost:3000/api/admin/clientes/${id}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) throw new Error("Error al obtener los datos del cliente");

    const cliente = await response.json();

    document.getElementById("editarClienteId").value = cliente.id_cliente;
    document.getElementById("editarNombre").value = cliente.nombre;
    document.getElementById("editarApellido").value = cliente.apellido;
    document.getElementById("editarEmail").value = cliente.email;
    document.getElementById("editarRut").value = cliente.rut;
    document.getElementById("editarTelefono").value = cliente.telefono;

    const modal = new bootstrap.Modal(document.getElementById("editarClienteModal"));
    modal.show();
  } catch (error) {
    console.error("Error al abrir el modal de edición:", error);
  }
}

document.getElementById("guardarCambios").addEventListener("click", async () => {
  const id = document.getElementById("editarClienteId").value;
  const nombre = document.getElementById("editarNombre").value;
  const apellido = document.getElementById("editarApellido").value;
  const email = document.getElementById("editarEmail").value;
  const rut = document.getElementById("editarRut").value;
  const telefono = document.getElementById("editarTelefono").value;

  try {
    const response = await fetch(`https://localhost:3000/api/admin/clientes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ nombre, apellido, email, rut, telefono }),
    });

    if (!response.ok) throw new Error("Error al actualizar el cliente");

    alert("Cliente actualizado exitosamente");
    const modal = bootstrap.Modal.getInstance(document.getElementById("editarClienteModal"));
    modal.hide();
    cargarClientes();
  } catch (error) {
    console.error("Error al guardar los cambios:", error);
  }
});
// Abrir modal de creación
document.getElementById("btn-crear-cliente").addEventListener("click", () => {
  const modal = new bootstrap.Modal(document.getElementById("crearClienteModal"));
  modal.show();
});

// Lógica para manejar el formulario de creación
document.getElementById("form-crear-cliente").addEventListener("submit", async (event) => {
  event.preventDefault();

  const nombre = document.getElementById("crearNombre").value.trim();
  const apellido = document.getElementById("crearApellido").value.trim();
  const rut = document.getElementById("crearRut").value.trim();
  const digitoVerificador = document.getElementById("crearDigitoVerificador").value.trim().toUpperCase();
  const email = document.getElementById("crearEmail").value.trim();
  const telefono = document.getElementById("crearTelefono").value.trim();
  const contrasena = document.getElementById("crearContrasena").value;
  const confirmarContrasena = document.getElementById("crearConfirmarContrasena").value;


  // Validaciones
  if (contrasena !== confirmarContrasena) {
    alert("Las contraseñas no coinciden.");
    return;
  }

  const validarRut = (rut, dv) => {
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

  if (!validarRut(rut, digitoVerificador)) {
    alert("El RUT ingresado es inválido.");
    return;
  }

  const datos = {
    nombre,
    apellido,
    email,
    telefono,
    contrasena,
    confirmarContrasena,
    rut,
    digitoVerificador,
  };
  
  const response = await fetch('https://localhost:3000/api/admin/clientes', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  

  try {
    const response = await fetch("https://localhost:3000/api/admin/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Asegúrate de incluir las cookies de sesión
      body: JSON.stringify(datos),
    });
  
    if (!response.ok) {
      const errorData = await response.json(); // Intenta obtener el mensaje de error del servidor
      throw new Error(errorData.error || "Error al crear cliente");
    }
  
    alert("Cliente creado exitosamente.");
    document.getElementById("form-crear-cliente").reset();
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("crearClienteModal")
    );
    modal.hide(); // Cierra el modal después de crear el cliente
    cargarClientes(); // Actualiza la lista de clientes
  } catch (error) {
    console.error("Error al crear cliente:", error);
    alert(error.message || "Ocurrió un error al intentar crear el cliente.");
  }
  
});
