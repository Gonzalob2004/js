// ----------------------------
// Simulador de Compras
// ----------------------------

const productos = ["Camiseta", "Pantalón", "Zapatillas", "Gorra","Ninguno"];
const precios = [15000, 25000, 35000, 10000,0];
let carrito = [];
let total = 0;


function mostrarProductos() {
  console.log("Productos disponibles:");
  for (let i = 0; i < productos.length; i++) {
        console.log(`${i + 1}. ${productos[i]} - $${precios[i]}`);
  }
}


function agregarAlCarrito() {
  let eleccion = prompt("¿Qué producto querés comprar? (1-4)\n1. Camiseta\n2. Pantalón\n3. Zapatillas\n4. Gorra\n5. Ninguno.");

  if (eleccion >= 1 && eleccion <= 5) {
    carrito.push(productos[eleccion - 1]);
    total += precios[eleccion - 1];
    alert(`Agregaste ${productos[eleccion - 1]} al carrito.`);
  } 
  else {
    alert("Opción no válida.");
  }
}


function iniciarSimulador() {
  alert("Bienvenido al simulador de compras Burshop 🛍️");
  mostrarProductos();

  let continuar = true;

  while (continuar) {
    agregarAlCarrito();
    continuar = confirm("¿Querés agregar otro producto?");
  }

  alert(`Tu carrito final: ${carrito.join(", ")}.\nTotal a pagar: $${total}`);
  console.log("Carrito final:", carrito);
  console.log("Total de compra:", total);
}


iniciarSimulador();
