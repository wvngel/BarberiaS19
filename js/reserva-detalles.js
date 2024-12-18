document.addEventListener("DOMContentLoaded", async () => {
  const fechaInput = document.getElementById("fechaInicio");
  const btnBuscarHorarios = document.getElementById("btnBuscarHorarios");
  const horariosContainer = document.getElementById("horarios-container");
  const barberosContainer = document.getElementById("barberos-container");
  const resumenFormSection = document.getElementById("resumen-form-section");
  const reservaForm = document.getElementById("reserva-form");

  let progressValue = 33;
  let fechaSeleccionada = "";
  let horarioSeleccionado = "";
  let barberoSeleccionado = null;

  // Barra de progreso dinámica
  const progressBar = document.createElement("div");
  progressBar.className = "progress mt-3";
  progressBar.innerHTML = `
    <div class="progress-bar bg-primary" id="barraProgreso" role="progressbar" style="width: ${progressValue}%;" aria-valuenow="${progressValue}" aria-valuemin="0" aria-valuemax="100"></div>
  `;
  document.querySelector(".container").insertBefore(progressBar, document.querySelector(".container").firstChild);

  const updateProgressBar = (value) => {
    const progressBarElement = document.getElementById("barraProgreso");
    progressBarElement.style.width = `${value}%`;
    progressBarElement.setAttribute("aria-valuenow", value);
  };

  // Verificar sesión y autocompletar datos
  const verificarSesion = async () => {
    try {
      const response = await fetch("https://localhost:3000/api/clientes/cliente-check-session", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();

        if (data.session && data.session.role === "cliente") {
          const cliente = data.session;
          document.getElementById("nombre").value = cliente.nombre || "";
          document.getElementById("apellido").value = cliente.apellido || "";
          document.getElementById("email").value = cliente.email || "";
          document.getElementById("rut").value = cliente.rut || "";
          document.getElementById("telefono").value = cliente.telefono || "";

          ["nombre", "apellido", "email", "rut", "telefono"].forEach((id) => {
            document.getElementById(id).readOnly = true;
          });
        }
      } else {
        console.log("No hay sesión activa.");
      }
    } catch (error) {
      console.error("Error al verificar la sesión:", error);
    }
  };

  await verificarSesion();

  const servicioSeleccionado = JSON.parse(localStorage.getItem("servicioSeleccionado"));
  if (!servicioSeleccionado) {
    alert("Por favor selecciona un servicio antes de continuar.");
    window.location.href = "servicios-disponibles.html";
    return;
  }

  document.getElementById("resumen-servicio").textContent = servicioSeleccionado.nombre;
  document.getElementById("resumen-tiempo").textContent = `${servicioSeleccionado.duracion} minutos`;
  document.getElementById("resumen-valor").textContent = `${servicioSeleccionado.precio}`;

  btnBuscarHorarios.addEventListener("click", async () => {
    fechaSeleccionada = fechaInput.value;

    if (!fechaSeleccionada) {
      alert("Por favor, selecciona una fecha.");
      return;
    }

    try {
      const response = await fetch(
        `https://localhost:3000/api/horariosDisponibles/horariosUnicos?fecha=${fechaSeleccionada}`
      );

      if (!response.ok) throw new Error("Error al obtener horarios.");

      const horarios = await response.json();
      mostrarHorarios(horarios);
      updateProgressBar(66);
    } catch (error) {
      console.error("Error al obtener horarios:", error);
      alert("No se pudieron cargar los horarios.");
    }
  });

  const mostrarHorarios = (horarios) => {
    horariosContainer.innerHTML = "";
    horarios.forEach((horario) => {
      const btn = document.createElement("button");
      btn.className = "btn btn-outline-primary m-2";
      btn.textContent = `${horario.hora_inicio} - ${horario.hora_fin}`;
      btn.dataset.horaInicio = horario.hora_inicio;

      btn.addEventListener("click", () => {
        horarioSeleccionado = horario.hora_inicio;
        obtenerBarberos();
      });

      horariosContainer.appendChild(btn);
    });
    document.getElementById("horarios-section").style.display = "block";
  };

  const obtenerBarberos = async () => {
    try {
      const response = await fetch(
        `https://localhost:3000/api/horariosDisponibles/barberosPorHorario?fecha=${fechaSeleccionada}&hora_inicio=${horarioSeleccionado}`
      );

      if (!response.ok) throw new Error("Error al obtener barberos.");

      const barberos = await response.json();
      mostrarBarberos(barberos);
    } catch (error) {
      console.error("Error al obtener barberos:", error);
      alert("No se pudieron cargar los barberos disponibles.");
    }
  };

  const mostrarBarberos = (barberos) => {
    barberosContainer.innerHTML = "";
    barberos.forEach((barbero) => {
      const card = document.createElement("div");
      card.className = "card m-2";
      card.style.width = "150px";

      card.innerHTML = `
        <img src="${barbero.foto || "default-image.jpg"}" class="card-img-top" alt="${barbero.nombre}">
        <div class="card-body">
          <h5 class="card-title">${barbero.nombre}</h5>
        </div>
      `;

      card.addEventListener("click", () => {
        barberoSeleccionado = barbero;
        avanzarAFormulario();
        updateProgressBar(100);
      });

      barberosContainer.appendChild(card);
    });
    document.getElementById("barberos-section").style.display = "block";
  };

  const avanzarAFormulario = () => {
    resumenFormSection.style.display = "flex";
    document.getElementById("resumen-dia").textContent = fechaSeleccionada;
    document.getElementById("resumen-hora").textContent = horarioSeleccionado;
    document.getElementById("resumen-barbero").textContent = barberoSeleccionado.nombre;
  };



  reservaForm.addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const nombreCliente = document.getElementById("nombre").value.trim();
    const apellidoCliente = document.getElementById("apellido").value.trim();
    const rutCliente = document.getElementById("rut").value.trim();
    const telefonoCliente = document.getElementById("telefono").value.trim();
    const emailCliente = document.getElementById("email").value.trim();
    const observaciones = document.getElementById("observaciones").value.trim();
  
    try {
      const response = await fetch("https://localhost:3000/api/reservas/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fecha: fechaSeleccionada,
          hora_inicio: horarioSeleccionado,
          id_barbero: barberoSeleccionado.id_barbero,
          id_servicio: servicioSeleccionado.id_servicio,
          observaciones,
          nombre: document.getElementById("nombre").value.trim(),
          apellido: document.getElementById("apellido").value.trim(),
          rut: document.getElementById("rut").value.trim(),
          telefono: document.getElementById("telefono").value.trim(),
          email: document.getElementById("email").value.trim(),
        }),
      });
      
      
      // Verificar la respuesta del servidor
      if (response.ok) {
        const data = await response.json();
        console.log("Respuesta completa del servidor:", data);
      
        if (data && data.datosModal) {
          console.log("DatosModal recibido:", data.datosModal); // Inspecciona el contenido
      
          const {
            nombreCliente = "N/A",
            codigoReserva = "N/A",
            servicio = "N/A",
            nombreBarbero = "N/A",
            fecha = "N/A",
            hora = "N/A",
            observaciones = "Ninguna",
          } = data.datosModal;
      
          // Llamar al modal
          mostrarReservaExito({
            nombreCliente,
            codigoReserva,
            servicio,
            nombreBarbero,
            fecha,
            hora,
            observaciones,
          });
        } else {
          console.error("La propiedad datosModal no existe:", data);
          throw new Error("Respuesta incompleta del servidor.");
        }
      } else {
        throw new Error("No se pudo confirmar la reserva.");
      }
      
    } catch (error) {
      console.error("Error al confirmar la reserva:", error);
      alert("No se pudo confirmar la reserva. Intenta nuevamente.");
    }
  });
  


  function mostrarReservaExito({
    nombreCliente,
    codigoReserva,
    servicio,
    nombreBarbero,
    fecha,
    hora,
    observaciones,
  }) {
    const modalElement = document.getElementById("reservaExitoModal");
  
    if (!modalElement) {
      console.error("Error: El modal con ID 'reservaExitoModal' no existe en el DOM.");
      return;
    }
  
    // Asignar valores a los elementos del modal
    document.getElementById("modalNombreCliente").textContent = nombreCliente;
    document.getElementById("modalCodigoReserva").textContent = codigoReserva;
    document.getElementById("modalServicio").textContent = servicio;
    document.getElementById("modalNombreBarbero").textContent = nombreBarbero;
    document.getElementById("modalFecha").textContent = fecha;
    document.getElementById("modalHora").textContent = hora;
    document.getElementById("modalObservaciones").textContent = observaciones || "Ninguna";
  
    // Mostrar el modal
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }
  
  
});