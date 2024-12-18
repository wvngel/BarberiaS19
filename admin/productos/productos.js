// Verificar sesion del administrador
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
  window.location.href = "../../login.html";
}

// Llamar a la función al cargar la página
document.addEventListener("DOMContentLoaded", verificarSesionAdmin);
//////
document.addEventListener("DOMContentLoaded", cargarProductos);

async function cargarProductos() {
  try {
    const response = await fetch("https://localhost:3000/api/admin/productos", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) throw new Error("Error al obtener los productos");

    const productos = await response.json();
    const tbody = document.getElementById("productos-tbody");
    tbody.innerHTML = "";

    productos.forEach((producto) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${producto.id_producto}</td>
        <td>${producto.nombre}</td>
        <td>${producto.descripcion}</td>
        <td>${producto.id_categoria}</td>
        <td>${producto.precio}</td>
        <td>${producto.stock}</td>
        <td><img src="${producto.imagen_url}" alt="Imagen del Producto" width="50"></td>
        <td>
          <button class="btn btn-primary btn-sm editar-producto" data-id="${producto.id_producto}">Editar</button>
          <button class="btn btn-danger btn-sm borrar-producto" data-id="${producto.id_producto}">Borrar</button>
        </td>
      `;
      tbody.appendChild(row);
    });

    agregarEventosBotones();
  } catch (error) {
    console.error("Error al cargar productos:", error);
  }
}

function agregarEventosBotones() {
  document.querySelectorAll(".editar-producto").forEach((button) => {
    button.addEventListener("click", (event) => {
      const productoId = event.target.dataset.id;
      abrirModalEditar(productoId);
    });
  });

  document.querySelectorAll(".borrar-producto").forEach((button) => {
    button.addEventListener("click", (event) => {
      const productoId = event.target.dataset.id;
      borrarProducto(productoId);
    });
  });
}

async function abrirModalEditar(id) {
  try {
    const response = await fetch(`https://localhost:3000/api/admin/productos/${id}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) throw new Error("Error al obtener los datos del producto");

    const producto = await response.json();

    document.getElementById("editarProductoId").value = producto.id_producto;
    document.getElementById("editarNombre").value = producto.nombre;
    document.getElementById("editarDescripcion").value = producto.descripcion;
    document.getElementById("editarCategoria").value = producto.id_categoria;
    document.getElementById("editarPrecio").value = producto.precio;
    document.getElementById("editarStock").value = producto.stock;
    document.getElementById("editarImagenUrl").value = producto.imagen_url;

    const modal = new bootstrap.Modal(document.getElementById("editarProductoModal"));
    modal.show();
  } catch (error) {
    console.error("Error al abrir el modal de edición:", error);
  }
}

document.getElementById("form-editar-producto").addEventListener("submit", async (event) => {
  event.preventDefault();

  const id = document.getElementById("editarProductoId").value;
  const nombre = document.getElementById("editarNombre").value;
  const descripcion = document.getElementById("editarDescripcion").value;
  const id_categoria = document.getElementById("editarCategoria").value;
  const precio = document.getElementById("editarPrecio").value;
  const stock = document.getElementById("editarStock").value;
  const imagenUrl = document.getElementById("editarImagenUrl").value;
  const imagenArchivo = document.getElementById("editarImagenArchivo").files[0];

  const formData = new FormData();
  formData.append("nombre", nombre);
  formData.append("descripcion", descripcion);
  formData.append("id_categoria", id_categoria);
  formData.append("precio", precio);
  formData.append("stock", stock);
  formData.append("imagenUrl", imagenUrl);
  if (imagenArchivo) formData.append("imagen", imagenArchivo);

  try {
    const response = await fetch(`https://localhost:3000/api/admin/productos/${id}`, {
      method: "PUT",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) throw new Error("Error al actualizar el producto");

    alert("Producto actualizado exitosamente");
    const modal = bootstrap.Modal.getInstance(document.getElementById("editarProductoModal"));
    modal.hide();
    cargarProductos();
  } catch (error) {
    console.error("Error al guardar los cambios:", error);
  }
});

async function borrarProducto(id) {
  if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
    try {
      const response = await fetch(`https://localhost:3000/api/admin/productos/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error al borrar el producto");
      }

      alert("Producto eliminado exitosamente");
      cargarProductos(); // Recarga la lista de productos
    } catch (error) {
      console.error("Error al borrar producto:", error);
      alert("Ocurrió un error al intentar eliminar el producto.");
    }
  }
}
