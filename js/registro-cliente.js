document.getElementById("register-form").addEventListener("submit", async (event) => {
    event.preventDefault();
  
    const nombre = document.getElementById("nombre").value;
    const apellido = document.getElementById("apellido").value;
    const rut = document.getElementById("rut").value;
    const email = document.getElementById("email").value;
    const telefono = document.getElementById("telefono").value;
    const contrasena = document.getElementById("password").value;

    try {
      const response = await fetch("http://localhost:3000/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, apellido, email, telefono, contrasena, rut}),
      });
  
      if (!response.ok) throw new Error("Error al registrar cliente.");
  
      alert("Cuenta creada exitosamente. Ahora puedes iniciar sesión.");
      window.location.href = "login.html";
    } catch (error) {
      console.error(error);
      alert("Error al registrar la cuenta.");
    }
  });
  