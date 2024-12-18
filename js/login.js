document.getElementById("login-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("https://localhost:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include", // Incluir cookies
    });

    if (!response.ok) {
      const errorData = await response.json();
      document.getElementById("error-message").textContent = errorData.error;
      document.getElementById("error-message").style.display = "block";
      return;
    }

    const data = await response.json();
    const { role, message } = data;

    alert(message); // Mostrar mensaje de bienvenida o éxito

    // Redirigir según el rol
    setTimeout(() => {
      if (role === "cliente") {
        window.location.href = "index.html"; // Redirigir al index del cliente
      } else if (role === "barbero") {
        window.location.href = "barberos/index-barbero.html"; // Redirigir al dashboard del barbero
      } else if (role === "admin") {
        window.location.href = "admin/index-admin.html"; // Redirigir al dashboard del administrador
      } 
    }, 500); // Opcional: esperar para sincronizar cookies
  } catch (error) {
    console.error("Error en el login:", error);
    document.getElementById("error-message").textContent = "Error en el servidor.";
    document.getElementById("error-message").style.display = "block";
  }
});
