// Referencias a elementos del DOM
const fechaInicioInput = document.getElementById('fechaInicio'); // Input para seleccionar la fecha de inicio de la semana.
const btnGenerarSemana = document.getElementById('btnGenerarSemana'); // Botón para generar la semana.
const diasSemanaDiv = document.getElementById('diasSemana'); // Contenedor para los días de la semana generada.
const horariosDisponiblesDiv = document.getElementById('horariosDisponibles'); // Contenedor para los horarios disponibles.
const horariosSeleccionadosDiv = document.getElementById('horariosSeleccionados'); // Contenedor para los horarios seleccionados.
const btnConfirmarHorarios = document.getElementById('btnConfirmarHorarios'); // Botón para confirmar los horarios seleccionados.

// Almacenar horarios seleccionados
let horariosSeleccionados = []; // Array para almacenar los horarios que el usuario selecciona.

// Evento para generar la semana
btnGenerarSemana.addEventListener('click', async () => {
  const fechaInicio = fechaInicioInput.value; // Obtiene el valor de la fecha seleccionada.

  if (!fechaInicio) {
    alert('Por favor, selecciona una fecha de inicio.'); // Valida que se haya ingresado una fecha.
    return;
  }

  try {
    const response = await fetch(
      `https://localhost:3000/api/barberos/horarios/semana?fecha_inicio=${fechaInicio}`,
      { credentials: 'include' } // Incluye cookies para autenticación.
    );

    if (!response.ok) {
      throw new Error('Error al obtener la semana disponible'); // Lanza un error si la solicitud falla.
    }

    const semana = await response.json(); // Obtiene los datos de la semana generada.
    diasSemanaDiv.innerHTML = ''; // Limpia el contenedor de días.

    semana.forEach(dia => {
      // Crea tarjetas para cada día de la semana.
      const diaDiv = document.createElement('div');
      diaDiv.className = 'card text-center mx-2';
      diaDiv.style.width = '150px';
      diaDiv.innerHTML = `
        <div class="card-body">
          <h5 class="card-title">${dia.dia}</h5>
          <p class="card-text">${dia.fecha}</p>
          <button class="btn btn-primary btn-sm btn-seleccionar-dia" data-fecha="${dia.fecha}">Seleccionar</button>
        </div>
      `;
      diasSemanaDiv.appendChild(diaDiv); // Agrega la tarjeta al contenedor.
    });

    agregarEventosSeleccionarDias(); // Agrega eventos a los botones de selección.
  } catch (error) {
    console.error(error);
    alert('Hubo un problema al generar la semana.'); // Muestra un mensaje de error al usuario.
  }
});

// Función para cargar horarios base al seleccionar un día
function agregarEventosSeleccionarDias() {
  const botonesSeleccionarDia = document.querySelectorAll('.btn-seleccionar-dia'); // Selecciona todos los botones "Seleccionar".

  botonesSeleccionarDia.forEach(boton => {
    boton.addEventListener('click', async (e) => {
      const fechaSeleccionada = e.target.getAttribute('data-fecha'); // Obtiene la fecha seleccionada.
      horariosSeleccionados = []; // Reinicia los horarios seleccionados.
      horariosSeleccionadosDiv.innerHTML = ''; // Limpia la vista de horarios seleccionados.

      try {
        const response = await fetch('https://localhost:3000/api/barberos/horarios/base', {
          credentials: 'include' // Incluye cookies para autenticación.
        });
        if (!response.ok) {
          throw new Error('No se pudieron cargar los horarios disponibles.'); // Lanza un error si falla la solicitud.
        }

        const horarios = await response.json(); // Obtiene los horarios disponibles.
        horariosDisponiblesDiv.innerHTML = ''; // Limpia el contenedor de horarios disponibles.

        horarios.forEach(horario => {
          // Crea inputs de tipo checkbox para cada horario.
          const horarioDiv = document.createElement('div');
          horarioDiv.className = 'form-check';

          horarioDiv.innerHTML = `
            <input class="form-check-input horario-checkbox" type="checkbox" id="horario-${horario.id_horario_base}" value="${horario.id_horario_base}">
            <label class="form-check-label" for="horario-${horario.id_horario_base}">
              ${horario.hora_inicio} - ${horario.hora_fin}
            </label>
          `;
          horariosDisponiblesDiv.appendChild(horarioDiv); // Agrega cada horario al contenedor.
        });

        btnConfirmarHorarios.setAttribute('data-fecha', fechaSeleccionada); // Almacena la fecha seleccionada en el botón.
      } catch (error) {
        console.error(error);
        alert('No se pudieron cargar los horarios disponibles.'); // Muestra un mensaje de error al usuario.
      }
    });
  });
}

// Evento para confirmar horarios seleccionados
btnConfirmarHorarios.addEventListener('click', async () => {
  const checkboxes = document.querySelectorAll('.horario-checkbox:checked'); // Selecciona todos los checkboxes marcados.
  const fechaSeleccionada = btnConfirmarHorarios.getAttribute('data-fecha'); // Obtiene la fecha seleccionada.
  const idBarbero = localStorage.getItem("id_barbero"); // Obtiene el ID del barbero desde el almacenamiento local.

  if (checkboxes.length === 0) {
    alert('Debe seleccionar al menos un horario.'); // Valida que se haya seleccionado al menos un horario.
    return;
  }

  // Crea un array con los horarios seleccionados.
  const horarios = Array.from(checkboxes).map(checkbox => ({
    id_horario_base: checkbox.value,
  }));

  try {
    const response = await fetch('https://localhost:3000/api/barberos/horarios/asignar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_barbero: idBarbero, fecha: fechaSeleccionada, horarios }),
      credentials: 'include' // Incluye cookies para autenticación.
    });

    const result = await response.json(); // Obtiene la respuesta del servidor.

    if (response.ok) {
      alert(result.message); // Muestra un mensaje de éxito.
    } else {
      alert(result.error || 'Error al asignar los horarios.'); // Muestra un mensaje de error si algo falla.
    }
  } catch (error) {
    console.error(error);
    alert('Hubo un problema al confirmar los horarios.'); // Muestra un mensaje de error general.
  }
});
