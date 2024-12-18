// Obtener datos del carrito desde localStorage
const cart = JSON.parse(localStorage.getItem("cart")) || [];
const orderSummary = document.getElementById("order-summary");
const orderTotal = document.getElementById("order-total");
const discountMessage = document.getElementById("discount-message");
let total = 0; // Total sin descuento
let descuentoAplicado = 0; // Valor del descuento

// Mostrar productos en el resumen de compra
function displayOrderSummary() {
  if (cart.length === 0) {
    orderSummary.innerHTML = `<li class="list-group-item">No hay productos en el carrito.</li>`;
    orderTotal.textContent = `$0`;
    return;
  }

  orderSummary.innerHTML = ""; // Limpiar resumen previo
  total = 0; // Reiniciar el total sin descuento

  cart.forEach((item) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
      <span>${item.quantity} x ${item.name}</span>
      <span>$${(item.price * item.quantity).toLocaleString()}</span>
    `;
    orderSummary.appendChild(li);
    total += item.price * item.quantity;
  });

  // Mostrar el total
  orderTotal.textContent = `$${total.toLocaleString()}`;
}

// Validar código de descuento
document.getElementById("apply-discount").addEventListener("click", () => {
  const discountCode = document.getElementById("discount-code").value.trim();

  if (discountCode === "FREESECTOR19") {
    const discountRate = 0.1; // 10% de descuento
    descuentoAplicado = total * discountRate; // Calcular descuento

    // Agregar línea de descuento en el resumen
    const descuentoRow = document.createElement("li");
    descuentoRow.className = "list-group-item d-flex justify-content-between align-items-center text-success";
    descuentoRow.innerHTML = `
      <span>DESCUENTO 10%</span>
      <span>-$${descuentoAplicado.toLocaleString()}</span>
    `;
    orderSummary.appendChild(descuentoRow);

    // Actualizar el total con descuento
    const discountedTotal = total - descuentoAplicado;
    orderTotal.textContent = `$${discountedTotal.toLocaleString()}`;

    // Mostrar mensaje de éxito
    discountMessage.textContent = "Descuento aplicado correctamente.";
    discountMessage.style.color = "green";
    discountMessage.style.display = "block";
  } else {
    // Mostrar mensaje de error
    discountMessage.textContent = "Introduce un código válido.";
    discountMessage.style.color = "red";
    discountMessage.style.display = "block";
  }
});

// Validar formulario antes de procesar el pago
document.querySelector("form").addEventListener("submit", (e) => {
  e.preventDefault(); // Prevenir el envío del formulario por defecto

  // Validar campos requeridos
  const email = document.querySelector("input[type='email']").value.trim();
  const nombre = document.querySelector("input[placeholder='Nombre']").value.trim();
  const apellidos = document.querySelector("input[placeholder='Apellidos']").value.trim();
  const telefono = document.querySelector("input[placeholder='Teléfono']").value.trim();
  const metodoPago = document.querySelector("input[name='paymentMethod']:checked");

  if (!email || !nombre || !apellidos || !telefono || !metodoPago) {
    alert("Por favor, completa todos los campos requeridos.");
    return;
  }

  // Simular procesamiento de pago
  alert("Pago procesado correctamente. ¡Gracias por tu compra!");
  localStorage.removeItem("cart"); // Vaciar el carrito después del pago
  window.location.href = "productos.html"; // Redirigir al usuario
});

// Cargar los datos al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  displayOrderSummary();
});
