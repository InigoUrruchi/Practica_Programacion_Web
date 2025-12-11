/*Crear el filtro por categorias*/
$.fn.dataTable.ext.search.push(function (settings, data) {
    console.log("🟡 Filtro ejecutado. data[4]:", data[4]);

    const seleccionadas = Array.from(
        document.querySelectorAll('input[name="categoria"]:checked')
    ).map(c => c.value.toLowerCase());

    console.log("🟡 Categorías seleccionadas:", seleccionadas);

    if (seleccionadas.length === 0) {
        console.log("🟡 Ninguna categoría seleccionada → fila visible");
        return true;
    }

    const categoriaFila = (data[4] || "").toLowerCase();
    const coincide = seleccionadas.includes(categoriaFila);

    console.log(
        "🟡 Comparando fila/categoría:",
        categoriaFila,
        "→ coincide:",
        coincide
    );

    return coincide;
});

function productos() {
    console.log("✅ productos() llamado");

    const token = localStorage.getItem("token");
    console.log("✅ Token:", token);

    fetch("https://practicaprogramacionweb.duckdns.org/products", {
        method: 'GET',
        headers: {
            "accept": "/",
            "Authorization": `Bearer ${token}`,
        },
    })
        .then(response => {
            console.log("✅ Respuesta fetch status:", response.status);
            return response.json();
        })
        .then(productos_json => {

            console.log("✅ Productos recibidos:", productos_json.length);

            const tbody = document.getElementById("body");
            console.log("✅ tbody encontrado:", !!tbody);
            tbody.innerHTML = "";

            productos_json.forEach(producto => {

                console.log("✅ Producto:", producto._id, producto.category);

                const id = producto._id;
                const nombre = producto.name;
                const precio = producto.price;
                const categoria = producto.category;
                const image = producto.image;
                const usuario = producto.idUser;
                const estado = producto.state;

                const tr = document.createElement("tr");
                const imagen = document.createElement("td");
                imagen.innerHTML = `<img src="${image}">`;
                const descripcion = document.createElement("td");
                const col_nombre = document.createElement("td");
                const col_precio = document.createElement("td");
                const col_categoria = document.createElement("td");
                col_nombre.textContent = nombre;
                col_precio.textContent = precio;
                col_categoria.textContent = categoria;

                descripcion.innerHTML = `
                    <p id="nombre_prod">${nombre}</p>
                    <p id="precio_prod">${precio}$</p>
                    <p><b>Categoría:</b> ${categoria}</p>
                    <p id="estado_prod">${estado}</p>
                    <button class="btn btn-primary boton_carrito" data-id="${id}" onclick="añadir_carrito(event)">Añadir al carrito</button>`;

                const boton_carrito = descripcion.querySelector(".boton_carrito");
                const estado_prod = descripcion.querySelector("#estado_prod");

                if (estado !== "En venta") {
                    boton_carrito.disabled = true;
                    boton_carrito.style.backgroundColor = "gray";
                    boton_carrito.innerText = "No disponible";

                    estado_prod.style.color = "red";
                }

                tr.appendChild(imagen);
                tr.appendChild(descripcion);
                tr.appendChild(col_nombre);
                tr.appendChild(col_precio);
                tr.appendChild(col_categoria);
                tbody.appendChild(tr);
            });

            console.log("✅ Filas pintadas en tbody:", tbody.rows.length);

            /*Inicializar la tabla */
            tabla = new DataTable("#table", {
                info: false,
                pageLength: 25,
                lengthChange: false,
                responsive: true,
                columnDefs: [
                    { targets: [2, 3, 4], visible: false },
                    { targets: [2], searchable: true },
                    { targets: [3], orderable: true },
                    { targets: [1], orderData: [3] },
                    { targets: [0], orderable: false },
                ]
            });

            console.log("✅ DataTable inicializada:", tabla);

            filtrar_categoria();

            /*Convertir mi input en el buscador de data tables*/
            const buscador = $("#buscador");
            console.log("✅ buscador encontrado (jQuery):", buscador.length);

            buscador.on("input", function () {
                console.log("🟢 Buscador input:", this.value);
                tabla.column(2).search(this.value).draw();
            });
        })
        .catch(err => {
            console.error("❌ Error en fetch o en productos():", err);
        });
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ DOMContentLoaded → llamando a productos()");
    productos();
});

function añadir_carrito(event) {
    const boton = event.target;
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    if (!carrito.includes(boton.dataset.id)) {
        carrito.push(boton.dataset.id);
        localStorage.setItem("carrito", JSON.stringify(carrito));
    }
}

function filtrar_categoria() {
    const checks = document.querySelectorAll('input[name="categoria"]');
    console.log("✅ Checkboxes categoria encontrados:", checks.length);

    checks.forEach(input => {
        input.addEventListener("change", () => {
            console.log("🟠 Cambio en checkbox:", input.value, "→ checked:", input.checked);
            tabla.draw();
        });
    });
}