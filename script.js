// ---------- CONSTANTES Y ESTADO ----------
const PRODUCTS_URL = "./products.json"; 
let productos = [];                     
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let userProfile = JSON.parse(localStorage.getItem("userProfile")) || { nombre: "", email: "", direccion: "" };

// ---------- SELECTORES ----------
const productosContainer = document.getElementById("productos-container");
const carritoLista = document.getElementById("carrito-lista");
const totalTexto = document.getElementById("total");
const cartCount = document.getElementById("cart-count");
const verCarritoBtn = document.getElementById("ver-carrito-btn");
const vaciarBtn = document.getElementById("vaciar-btn");
const checkoutBtn = document.getElementById("checkout-btn");

// ---------- FUNCIONES UTILITARIAS ----------
function formatPeso(n) {
  return n.toLocaleString("es-AR");
}

function saveState() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
  localStorage.setItem("userProfile", JSON.stringify(userProfile));
}

// Busca producto por id
function getProductById(id) {
  return productos.find(p => p.id === id);
}

// ---------- RENDERIZADO ----------
function renderProductos() {
  productosContainer.innerHTML = "";
  productos.forEach(prod => {
    const card = document.createElement("div");
    card.className = "producto-card";
    card.innerHTML = `
      <img src="${prod.imagen}" alt="${prod.nombre}">
      <h3>${prod.nombre}</h3>
      <p>$${formatPeso(prod.precio)}</p>
      <small>Stock: ${prod.stock}</small>
      <button class="add-btn" ${prod.stock===0 ? "disabled" : ""} data-id="${prod.id}">
        Agregar al carrito
      </button>
    `;
    productosContainer.appendChild(card);
  });
}

// Actualiza el panel del carrito
function actualizarCarritoUI() {
  carritoLista.innerHTML = "";
  let total = 0;
  carrito.forEach((item, index) => {
    total += item.precio * item.cantidad;
    const li = document.createElement("li");
    li.className = "item-carrito";
    li.innerHTML = `
      <span>${item.nombre} x${item.cantidad} - $${formatPeso(item.precio * item.cantidad)}</span>
      <div class="qty-controls">
        <button class="small-btn" data-action="dec" data-index="${index}">-</button>
        <button class="small-btn" data-action="inc" data-index="${index}">+</button>
        <button class="small-btn danger" data-action="del" data-index="${index}">Eliminar</button>
      </div>
    `;
    carritoLista.appendChild(li);
  });
  totalTexto.textContent = `Total: $${formatPeso(total)}`;
  cartCount.textContent = carrito.reduce((s, it) => s + it.cantidad, 0);
  saveState();
}

// ---------- LOGICA DEL CARRITO ----------
function agregarAlCarrito(id, cantidad = 1) {
  const producto = getProductById(id);
  if (!producto || producto.stock <= 0) {
    Swal.fire({ icon: "error", title: "Sin stock", text: "El producto no está disponible." });
    return;
  }

  const existente = carrito.find(it => it.id === id);
  if (existente) {
    
    if (existente.cantidad + cantidad > producto.stock) {
      Swal.fire({ icon: "warning", title: "Límite de stock", text: "No hay suficiente stock disponible." });
      return;
    }
    existente.cantidad += cantidad;
  } else {
    carrito.push({ id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad });
  }
  actualizarCarritoUI();
  Swal.fire({ toast:true, position:"top-end", showConfirmButton:false, timer:1200, icon:"success", title:"Agregado al carrito" });
}

function cambiarCantidad(index, delta) {
  const item = carrito[index];
  if (!item) return;
  const prod = getProductById(item.id);
  const nueva = item.cantidad + delta;
  if (nueva <= 0) {
    carrito.splice(index,1);
  } else if (nueva > prod.stock) {
    Swal.fire({ icon:"warning", title:"Stock insuficiente", text:"No hay tanto stock."});
  } else {
    item.cantidad = nueva;
  }
  actualizarCarritoUI();
}

function eliminarItem(index) {
  carrito.splice(index,1);
  actualizarCarritoUI();
}

function vaciarCarrito() {
  if (carrito.length === 0) {
    Swal.fire({ icon:"info", title:"Carrito vacío" });
    return;
  }
  Swal.fire({
    title: 'Vaciar carrito?',
    text: "Se eliminarán todos los productos.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, vaciar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      carrito = [];
      actualizarCarritoUI();
      Swal.fire('Vaciado', 'El carrito quedó vacío.', 'success');
    }
  });
}


async function checkoutFlow() {
  if (carrito.length === 0) {
    Swal.fire({ icon: "info", title: "Carrito vacío", text: "Agrega productos antes de comprar."});
    return;
  }

  
  const formHtml = `
    <input id="swal-input-nombre" class="swal2-input" placeholder="Nombre" value="${escapeHtml(userProfile.nombre)}">
    <input id="swal-input-email" class="swal2-input" placeholder="Email" value="${escapeHtml(userProfile.email)}">
    <input id="swal-input-direccion" class="swal2-input" placeholder="Dirección" value="${escapeHtml(userProfile.direccion)}">
  `;

  const { value: formValues } = await Swal.fire({
    title: 'Completa tus datos',
    html: formHtml,
    focusConfirm: false,
    showCancelButton: true,
    preConfirm: () => {
      const nombre = document.getElementById('swal-input-nombre').value.trim();
      const email = document.getElementById('swal-input-email').value.trim();
      const direccion = document.getElementById('swal-input-direccion').value.trim();
      if (!nombre || !email || !direccion) {
        Swal.showValidationMessage('Completa todos los campos');
        return false;
      }
      return { nombre, email, direccion };
    }
  });

  if (!formValues) return; 

  
  userProfile = { nombre: formValues.nombre, email: formValues.email, direccion: formValues.direccion };
  saveState();

  
  Swal.fire({ title: 'Procesando pago...', didOpen: () => { Swal.showLoading(); } });
  await new Promise(res => setTimeout(res, 1300)); // espera simulada

  
  let stockError = false;
  carrito.forEach(it => {
    const prod = getProductById(it.id);
    if (prod.stock < it.cantidad) stockError = true;
  });
  if (stockError) {
    Swal.fire({ icon: "error", title: "Error de stock", text: "Algunos productos ya no están disponibles en la cantidad solicitada."});
    return;
  }
  carrito.forEach(it => {
    const prod = getProductById(it.id);
    prod.stock -= it.cantidad;
  });

  
  const orden = {
    id: Date.now(),
    date: new Date().toISOString(),
    items: [...carrito],
    total: carrito.reduce((s,i) => s + i.precio*i.cantidad, 0),
    customer: userProfile
  };

  
  carrito = [];
  saveState();
  renderProductos();
  actualizarCarritoUI();

  Swal.fire({ icon: "success", title: "Compra realizada", html: `Orden #${orden.id} - Total: $${formatPeso(orden.total)}` });
}


function escapeHtml(str) {
  return (str || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}


document.addEventListener("click", (e) => {
  const addBtn = e.target.closest(".add-btn");
  if (addBtn) {
    const id = Number(addBtn.dataset.id);
    agregarAlCarrito(id, 1);
    return;
  }

  const detailsBtn = e.target.closest(".details-btn");
  if (detailsBtn) {
    const id = Number(detailsBtn.dataset.id);
    const p = getProductById(id);
    Swal.fire({ title: p.nombre, html: `<p>Precio: $${formatPeso(p.precio)}<br>Stock: ${p.stock}</p>`, confirmButtonText: "Cerrar" });
    return;
  }


  const act = e.target.closest("[data-action]");
  if (act) {
    const action = act.dataset.action;
    const index = Number(act.dataset.index);
    if (action === "inc") cambiarCantidad(index, +1);
    if (action === "dec") cambiarCantidad(index, -1);
    if (action === "del") eliminarItem(index);
  }
});

// botones superiores
verCarritoBtn.addEventListener("click", () => {
  
  document.getElementById("carrito-panel").scrollIntoView({ behavior: "smooth" });
});
vaciarBtn.addEventListener("click", vaciarCarrito);
checkoutBtn.addEventListener("click", checkoutFlow);


async function loadProducts() {
  try {
    const resp = await fetch(PRODUCTS_URL);
    if (!resp.ok) throw new Error("No se pudo cargar products.json");
    productos = await resp.json();
  } catch (err) {
    
    productos = [
      { id: 1, nombre: "Remera", precio: 5000, stock: 10 },
      { id: 2, nombre: "Pantalón", precio: 12000, stock: 5 },
      { id: 3, nombre: "Zapatillas", precio: 35000, stock: 3 },
      { id: 4, nombre: "Campera", precio: 25000, stock: 2 }
    ];
  } finally {
    renderProductos();
    actualizarCarritoUI();
  }
}


loadProducts();
