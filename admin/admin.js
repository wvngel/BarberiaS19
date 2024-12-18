
// Función para cargar Navbar y Footer
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Cargar Navbar
    const navbarContainer = document.getElementById("navbar-container");
    const navbarResponse = await fetch("shared/navbar.html");
    if (!navbarResponse.ok) throw new Error("Error al cargar el navbar");
    navbarContainer.innerHTML = await navbarResponse.text();

    // Cargar Footer
    const footerContainer = document.getElementById("footer-container");
    const footerResponse = await fetch("shared/footer.html");
    if (!footerResponse.ok) throw new Error("Error al cargar el footer");
    footerContainer.innerHTML = await footerResponse.text();
  } catch (error) {
    console.error("Error al cargar la estructura:", error);
  }
});


//Verificar sesion de administrador
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
  window.location.href = "../login.html";
}

// Llamar a la función al cargar la página
document.addEventListener("DOMContentLoaded", verificarSesionAdmin);
