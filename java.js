const productos = [
  { id: 1, nombre: "Remera", precio: 5000 },
  { id: 2, nombre: "Pantalón", precio: 12000 },
  { id: 3, nombre: "Zapatillas", precio: 35000 },
  { id: 4, nombre: "Campera", precio: 25000 },
];

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// ----- FUNCIONES -----
function mostrarProductos() {
  const contenedor = document.getElementById("productos-container");
  contenedor.innerHTML = "";

  productos.forEach((prod) => {
    const div = document.createElement("div");
    div.classList.add("producto");
    div.innerHTML = `
      <h3>${prod.nombre}</h3>
      <p>$${prod.precio}</p>
      <button onclick="agregarAlCarrito(${prod.id})">Agregar</button>
    `;
    contenedor.appendChild(div);
  });
}

function agregarAlCarrito(id) {
  const producto = productos.find((p) => p.id === id);
  carrito.push(producto);
  actualizarCarrito();
}

function actualizarCarrito() {
  const lista = document.getElementById("carrito-lista");
  const totalTexto = document.getElementById("total");

  lista.innerHTML = "";
  let total = 0;

  carrito.forEach((item, index) => {
    total += item.precio;

    const li = document.createElement("li");
    li.classList.add("item-carrito");
    li.innerHTML = `
      ${item.nombre} - $${item.precio}
      <button class="eliminar-btn" onclick="eliminarDelCarrito(${index})">❌</button>
    `;
    lista.appendChild(li);
  });

  totalTexto.textContent = `Total: $${total}`;

  // Guardar en localStorage
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

function vaciarCarrito() {
  carrito = [];
  localStorage.removeItem("carrito");
  actualizarCarrito();
}
function eliminarDelCarrito(indice) {
  carrito.splice(indice, 1); // elimina 1 elemento en la posición 'indice'
  actualizarCarrito();       // actualiza la vista y el total
}
// ----- EVENTOS -----
document.getElementById("vaciar-btn").addEventListener("click", vaciarCarrito);

// ----- INICIO -----
mostrarProductos();
actualizarCarrito();