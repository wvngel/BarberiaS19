// Elementos principales
const searchBar = document.getElementById("search-bar");
const productosContainer = document.getElementById("productos-container");
const botonVerMas = document.getElementById("ver-mas");
const cartButton = document.getElementById("cart-button");
const cartContainer = document.getElementById("shopping-cart");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartCount = document.getElementById("cart-count");
const closeCartButton = document.createElement("button");

let productos = []; // Array para almacenar productos desde el backend
let productosMostrados = 0; // Contador para productos mostrados por el botón "Ver Más"
const productosPorPagina = 6; // Número de productos por página
const cart = []; // Carrito de compras

// Cargar botón para cerrar el carrito
closeCartButton.textContent = "✖";
closeCartButton.className = "btn btn-light position-absolute top-0 end-0 m-2";
cartContainer.prepend(closeCartButton);

closeCartButton.addEventListener("click", () => {
  cartContainer.style.display = "none";
});

cartButton.addEventListener("click", () => {
  cartContainer.style.display = cartContainer.style.display === "none" ? "block" : "none";
});

// Función para cargar productos desde el backend
async function cargarProductos() {
  try {
    const response = await fetch("https://localhost:3000/api/productos", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Error al cargar los productos");
    }

    productos = await response.json();
    productosMostrados = 0; // Reiniciar el contador
    mostrarProductos(); // Mostrar los productos iniciales
  } catch (error) {
    console.error("Error al cargar los productos:", error);
    alert("Hubo un problema al cargar los productos. Intenta nuevamente más tarde.");
  }
}

// Función para mostrar productos
function mostrarProductos(filtrados = productos) {
  const limite = Math.min(productosMostrados + productosPorPagina, filtrados.length);

  for (let i = productosMostrados; i < limite; i++) {
    const producto = filtrados[i];
    const col = document.createElement("div");
    col.classList.add("col-md-4");

    col.innerHTML = `
      <div class="card text-light border-secondary" style="background-color: #white;">
        <img src="${producto.imagen_url}" class="card-img-top" alt="${producto.nombre}">
        <div class="card-body text-center">
          <h5 class="card-title">${producto.nombre}</h5>
          <p class="card-text">$${producto.precio.toLocaleString()}</p>
          <button class="btn btn-primary" style="background-color: black; border-color: black;">Añadir al carrito</button>
        </div>
      </div>
    `;
    productosContainer.appendChild(col);
  }

  productosMostrados = limite;

  // Actualizar el estado del botón "Ver Más"
  if (filtrados.length <= productosMostrados) {
    botonVerMas.style.display = "none";
  } else {
    botonVerMas.style.display = "block";
  }
}

// Evento para el botón "Ver Más"
botonVerMas.addEventListener("click", () => {
  mostrarProductos();
});

// Función para filtrar productos
searchBar.addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();
  const productosFiltrados = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(query)
  );

  productosContainer.innerHTML = ""; // Limpiar el contenedor de productos
  productosMostrados = 0; // Resetear el contador
  mostrarProductos(productosFiltrados);
});

// Función para actualizar el carrito
function updateCart() {
  cartItems.innerHTML = ""; // Limpiar el contenido del carrito
  let total = 0;

  cart.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
      <span>${item.quantity} x ${item.name}</span>
      <span>$${(item.price * item.quantity).toLocaleString()}</span>
      <button class="btn btn-danger btn-sm" onclick="removeFromCart(${index})">✖</button>
    `;
    cartItems.appendChild(li);
    total += item.price * item.quantity;
  });

  cartTotal.textContent = `$${total.toLocaleString()}`;
  cartCount.textContent = cart.reduce((acc, item) => acc + item.quantity, 0);
}

// Añadir producto al carrito
function addToCart(name, price) {
  const existingItem = cart.find((item) => item.name === name);

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ name, price, quantity: 1 });
  }

  updateCart();
}

// Eliminar producto del carrito
function removeFromCart(index) {
  cart.splice(index, 1);
  updateCart();
}

// Evento para los botones "Añadir al carrito"
productosContainer.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON") {
    const card = e.target.closest(".card");
    const name = card.querySelector(".card-title").textContent;
    const price = parseInt(card.querySelector(".card-text").textContent.replace("$", "").replace(/\./g, ""));

    addToCart(name, price);
  }
});

// Redirigir al usuario a la página de pago
document.getElementById("checkout-btn").addEventListener("click", () => {
  if (cart.length === 0) {
    alert("El carrito está vacío. Agrega productos antes de proceder al pago.");
    return;
  }
  localStorage.setItem("cart", JSON.stringify(cart)); // Guardar el carrito en LocalStorage
  window.location.href = "pago.html"; // Redirigir a la página de pago
});

// Inicializar la carga de productos al cargar la página
document.addEventListener("DOMContentLoaded", cargarProductos);
