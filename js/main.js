// Función para cargar los componentes dinámicos (navbar y footer)
async function loadComponents() {
  try {
    // Carga dinámica del navbar
    const navbar = await fetch('estructura/navbar.html').then((res) => res.text());
    document.getElementById('navbar').innerHTML = navbar;

    // Verificar sesión después de cargar el navbar
    verificarSesionCliente();

    // Carga dinámica del footer
    const footer = await fetch('estructura/footer.html').then((res) => res.text());
    document.getElementById('footer').innerHTML = footer;
  } catch (error) {
    console.error('Error al cargar los componentes:', error);
  }
}

// Función para verificar si existe una sesión activa
async function verificarSesionCliente() {
  try {
    const response = await fetch('https://localhost:3000/api/clientes/cliente-check-session', {
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();

      // Personalizar la página si es un cliente autenticado
      if (data.session && data.session.role === 'cliente') {
        mostrarExperienciaCliente(data.session);
      }
    } else {
      // No hay sesión activa
      mostrarExperienciaGeneral();
    }
  } catch (error) {
    console.error('Error al verificar la sesión:', error);
    mostrarExperienciaGeneral();
  }
}

// Función para personalizar la experiencia del cliente
function mostrarExperienciaCliente(cliente) {
  const navAuthItem = document.getElementById('nav-auth-item');
  if (navAuthItem) {
    navAuthItem.innerHTML = `
      <a class="nav-link" href="mi-perfil.html">Hola, ${cliente.nombre}</a>
      <a class="nav-link" id="cerrar-sesion-btn" href="#">Cerrar sesión</a>
    `;
    // Enlazar evento al botón "Cerrar sesión"
    const cerrarSesionBtn = document.getElementById("cerrar-sesion-btn");
    cerrarSesionBtn.addEventListener("click", cerrarSesion);
  }

  // Autocompletar formularios si es necesario
  const nombreInput = document.getElementById('nombre-cliente');
  if (nombreInput) {
    nombreInput.value = cliente.nombre;
  }

  // Otras personalizaciones según la página actual...
}

// Función para mostrar una experiencia general
function mostrarExperienciaGeneral() {
  const navAuthItem = document.getElementById('nav-auth-item');
  if (navAuthItem) {
    navAuthItem.innerHTML = `
      <a class="nav-link" href="login.html">Iniciar sesión</a>
    `;
  }
}

// Función para cerrar sesión
async function cerrarSesion() {
  try {
    const response = await fetch('https://localhost:3000/api/clientes/logout', {
      method: 'POST',
      credentials: 'include', // Incluir cookies para la sesión
    });

    if (response.ok) {
      alert("Sesión cerrada exitosamente");
      window.location.href = "index.html"; // Redirigir al login después de cerrar sesión
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

// Ejecutar la carga de componentes al cargar la página
document.addEventListener('DOMContentLoaded', loadComponents);
