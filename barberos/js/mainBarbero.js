// Cargar Navbar y Footer dinámicamente
async function cargarEstructura() {
  try {
    // Cargar el contenido del Navbar desde un archivo HTML
    const navbarContainer = document.getElementById("navbar-container"); // Referencia al contenedor del navbar.
    const navbarResponse = await fetch("navbarBarberos.html"); // Solicita el contenido del archivo del navbar.
    navbarContainer.innerHTML = await navbarResponse.text(); // Inserta el contenido en el contenedor.

    // Cargar el contenido del Footer desde un archivo HTML
    const footerContainer = document.getElementById("footer-container"); // Referencia al contenedor del footer.
    //const footerResponse = await fetch("footer.html"); // Descomentado en caso de usar footer.
    footerContainer.innerHTML = await footerResponse.text(); // Inserta el contenido en el contenedor del footer.
  } catch (error) {
    // Manejar errores durante la carga de los componentes
    console.error("Error cargando la estructura:", error);
  }
}

// Función para cargar el nombre del barbero y configurar el cierre de sesión
async function inicializarBarbero() {
  try {
    // Verifica la sesión activa del barbero
    const response = await fetch('https://localhost:3000/api/barberos/check-session', {
      credentials: 'include', // Incluye cookies para manejar la sesión.
    });

    if (response.ok) {
      const data = await response.json();

      if (data.session && data.session.role === 'barbero') {
        // Si hay sesión activa, muestra el nombre del barbero en el navbar
        const nombreBarbero = document.getElementById('nombre-barbero');
        if (nombreBarbero) {
          nombreBarbero.textContent = `Hola, ${data.session.nombre}`;
        }

        // Configura el botón de cierre de sesión
        const cerrarSesionBtn = document.getElementById('cerrar-sesion-btn');
        if (cerrarSesionBtn) {
          cerrarSesionBtn.addEventListener('click', cerrarSesionBarbero); // Asocia la función de cierre de sesión.
        }
      } else {
        // Si no hay sesión activa, redirige al inicio de sesión
        alert('No hay sesión activa. Redirigiendo al inicio de sesión.');
        window.location.href = 'login.html';
      }
    } else {
      // Maneja errores en la respuesta de la verificación
      alert('Error al verificar la sesión. Redirigiendo al inicio de sesión.');
      window.location.href = 'login.html';
    }
  } catch (error) {
    // Maneja errores del servidor durante la verificación de sesión
    console.error('Error al inicializar la página del barbero:', error);
    alert('Error en el servidor. Intenta nuevamente.');
    window.location.href = 'login.html';
  }
}

// Función para cerrar sesión del barbero
async function cerrarSesionBarbero() {
  try {
    const response = await fetch('https://localhost:3000/api/barberos/logout', {
      method: 'POST',
      credentials: 'include', // Incluye cookies para manejar la sesión.
    });

    if (response.ok) {
      // Si el cierre de sesión es exitoso, redirige a la página principal
      alert('Sesión cerrada exitosamente.');
      window.location.href = '../index.html';
    } else {
      // Maneja errores durante el cierre de sesión
      const errorData = await response.json();
      console.error('Error al cerrar sesión del barbero:', errorData.error);
      alert('Hubo un problema al cerrar la sesión.');
    }
  } catch (error) {
    // Maneja errores del servidor al cerrar sesión
    console.error('Error al cerrar sesión del barbero:', error);
    alert('Error en el servidor al intentar cerrar sesión.');
  }
}

// Ejecutar la carga de la estructura y la inicialización del barbero al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
  await cargarEstructura(); // Carga dinámicamente el Navbar y el Footer.
  inicializarBarbero(); // Configura la sesión y personaliza el contenido para el barbero.
});
