document.addEventListener("DOMContentLoaded", async () => {
  // Referencias a elementos del DOM
  const navbarContainer = document.getElementById("navbar-container"); // Contenedor para cargar el navbar dinámicamente.
  const footerContainer = document.getElementById("footer-container"); // Contenedor para cargar el footer dinámicamente.
  const reservasTableBody = document.getElementById("reservas-table-body"); // Contenedor para la tabla de reservas.

  // Función para cargar el navbar y footer dinámicamente
  const cargarEstructura = async () => {
      try {
          const navbarResponse = await fetch("../estructura/navbarBarberos.html"); // Carga el contenido del navbar desde un archivo externo.
          navbarContainer.innerHTML = await navbarResponse.text(); // Inserta el contenido cargado en el contenedor del navbar.

          const footerResponse = await fetch("../estructura/footerBarberos.html"); // Carga el contenido del footer desde un archivo externo.
          footerContainer.innerHTML = await footerResponse.text(); // Inserta el contenido cargado en el contenedor del footer.
      } catch (error) {
          // Manejo de errores en la carga del navbar o footer
          console.error("Error cargando la estructura:", error);
      }
  };

  // Función para obtener las reservas asociadas al barbero
  const obtenerReservas = async () => {
      try {
          const response = await fetch("https://localhost:3000/api/reservas/mis-reservas", {
              credentials: "include", // Incluye las cookies de sesión en la solicitud.
          });

          if (!response.ok) {
              throw new Error("Error al cargar las reservas"); // Si la respuesta no es exitosa, lanza un error.
          }

          const reservas = await response.json(); // Convierte la respuesta a formato JSON.
          renderizarReservas(reservas); // Llama a la función para mostrar las reservas en la tabla.
      } catch (error) {
          // Manejo de errores al obtener las reservas
          console.error("Error al cargar reservas:", error);
          alert("Hubo un problema al cargar las reservas. Inténtalo de nuevo."); // Mensaje al usuario en caso de error.
      }
  };

  // Función para mostrar las reservas en la tabla
  const renderizarReservas = (reservas) => {
      reservasTableBody.innerHTML = ""; // Limpia el contenido previo de la tabla.

      reservas.forEach((reserva) => {
          const row = document.createElement("tr"); // Crea una nueva fila para la tabla.
          row.innerHTML = `
              <td>${reserva.nombre || "N/A"}</td> <!-- Nombre del cliente asociado a la reserva. -->
              <td>${reserva.apellido || "N/A"}</td> <!-- Apellido del cliente. -->
              <td>${reserva.email || "N/A"}</td> <!-- Email del cliente. -->
              <td>${reserva.servicio || "N/A"}</td> <!-- Servicio reservado. -->
              <td>${reserva.fecha || "N/A"}</td> <!-- Fecha de la reserva. -->
              <td>${reserva.hora || "N/A"}</td> <!-- Hora de la reserva. -->
              <td>${reserva.observaciones || "Sin observaciones"}</td> <!-- Observaciones proporcionadas por el cliente. -->
              <td>${new Date(reserva.fecha_creacion).toLocaleString()}</td> <!-- Fecha y hora en que se creó la reserva. -->
          `;
          reservasTableBody.appendChild(row); // Agrega la fila a la tabla de reservas.
      });
  };

  // Inicialización de la página
  await cargarEstructura(); // Carga el navbar y footer dinámicamente.
  await obtenerReservas(); // Obtiene y muestra las reservas en la tabla.
});
