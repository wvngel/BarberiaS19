document.addEventListener("DOMContentLoaded", () => {
  const categories = document.getElementById("categories");
  const searchBar = document.getElementById("searchBar");
  const servicesContainer = document.getElementById("services-container");

  // Función para obtener servicios
  const fetchServices = async () => {
    try {
      const response = await fetch("https://localhost:3000/api/serviciosDisponibles/");
      
      const services = await response.json();
      displayServices(services);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  // Función para mostrar servicios en la página
  const displayServices = (services) => {
    servicesContainer.innerHTML = "";
    services.forEach((service) => {
      const serviceCard = document.createElement("div");
      serviceCard.className = "card mb-3";
      serviceCard.setAttribute("data-category", service.categoria); // Agrega categoría
      serviceCard.innerHTML = `
        <div class="card-body">
          <h5 class="card-title">${service.nombre}</h5>
          <p class="card-text">${service.descripcion}</p>
          <p class="card-text"><strong>${service.duracion_minutos} min - $${service.precio}</strong></p>
          <button class="btn btn-dark seleccionar-servicio">Agendar servicio</button>
        </div>
      `;

      // Evento para guardar el servicio seleccionado
      const boton = serviceCard.querySelector(".seleccionar-servicio");
      boton.addEventListener("click", () => {
        const servicioSeleccionado = {
          id_servicio: service.id_servicio,
          nombre: service.nombre,
          duracion: service.duracion_minutos,
          precio: service.precio,
        };
        // Guardar datos en localStorage
        localStorage.setItem("servicioSeleccionado", JSON.stringify(servicioSeleccionado));
        // Redirigir a la página de detalles
        window.location.href = "reserva-detalles.html";
      });

      servicesContainer.appendChild(serviceCard);
    });
  };

  // Filtro por categoría
  categories.addEventListener("click", (e) => {
    if (e.target.tagName === "LI") {
      const category = e.target.getAttribute("data-category");
      Array.from(categories.children).forEach((item) => item.classList.remove("active"));
      e.target.classList.add("active");

      filterServices(category);
    }
  });

  // Filtro por búsqueda
  searchBar.addEventListener("input", () => {
    const query = searchBar.value.toLowerCase();
    filterServices(null, query);
  });

  // Función para filtrar servicios
  const filterServices = (category = null, query = "") => {
    const serviceCards = Array.from(servicesContainer.children);

    serviceCards.forEach((card) => {
      const title = card.querySelector(".card-title").textContent.toLowerCase();
      const serviceCategory = card.getAttribute("data-category");

      const matchesCategory = !category || category === "Todos" || serviceCategory === category;
      const matchesQuery = title.includes(query);

      if (matchesCategory && matchesQuery) {
        card.style.display = "";
      } else {
        card.style.display = "none";
      }
    });
  };

  // Cargar servicios al cargar la página
  fetchServices();
});
