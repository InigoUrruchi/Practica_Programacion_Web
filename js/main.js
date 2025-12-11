
/*Crear el filtro por categorias*/
$.fn.dataTable.ext.search.push(function(settings, data) {

    const seleccionadas = Array.from(
        document.querySelectorAll('input[name="categoria"]:checked')
    ).map(c => c.value);

    if (seleccionadas.length === 0) return true;

    const categoriaFila = data[4].toLowerCase();

    return seleccionadas.includes(categoriaFila);
});

function productos() {
    token = localStorage.getItem("token")

    fetch("https://practicaprogramacionweb.duckdns.org/products", {
        method: 'GET',
        headers: {
            "accept": "/",
            "Authorization": `Bearer ${token}`,
        },
    })

        .then(response => response.json())

        .then(productos_json => {

            tbody = document.getElementById("body")
            productos_json.forEach(producto => {

                id = producto._id
                nombre = producto.name
                precio = producto.price
                categoria = producto.category
                image = producto.image
                usuario = producto.idUser
                estado = producto.state

                tr = document.createElement("tr")
                imagen = document.createElement("td")
                imagen.innerHTML = `<img src="${image}">`
                descripcion = document.createElement("td")
                col_nombre = document.createElement("td")
                col_precio = document.createElement("td")
                col_categoria = document.createElement("td")
                col_nombre.textContent = nombre
                col_precio.textContent = precio
                col_categoria.textContent = categoria

                descripcion.innerHTML = `
                    <p id = "nombre_prod">${nombre}</p>
                    <p id = "precio_prod">${precio}$</p>
                    <p><b>Categoría:</b> ${categoria}</p>
                    <p id = "estado_prod">${estado}</p>
                    <button class="btn btn-primary boton_carrito" data-id="${id}" onclick="añadir_carrito(event)">Añadir al carrito</button>`

                boton_carrito = descripcion.querySelector(".boton_carrito");
                estado_prod = descripcion.querySelector("#estado_prod");

                if (estado !== "En venta") {
                    boton_carrito.disabled = true;
                    boton_carrito.style.backgroundColor = "gray";
                    boton_carrito.innerText = "No disponible";

                    estado_prod.style.color = "red";
                }

                tr.appendChild(imagen)
                tr.appendChild(descripcion)
                tr.appendChild(col_nombre)
                tr.appendChild(col_precio)
                tr.appendChild(col_categoria)
                tbody.appendChild(tr)
            })

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
                    { targets: [0], orderable: false},
                ]
            })
            filtrar_categoria();

            /*Convertir mi input en el buscador de data tables*/
            const buscador = $("#buscador");

            buscador.on("input", function () {
                tabla.column(2).search(this.value).draw();
            });

            /*Al pulsar el boton ordenar por precio ordena la tabla ascendente o descendente*/
            asc = true
            ordenar_precio = document.getElementById("ordenPrecio")
            ordenar_precio.addEventListener("click", () => {
            tabla.order([3, asc ? "asc" : "desc"]).draw();

            /*Alternar icono*/
            ordenar_precio.innerText = asc ? "Precio ↑" : "Precio ↓";

            asc = !asc;
            });
        })
}

document.addEventListener("DOMContentLoaded", productos);


function añadir_carrito(event) {
    const boton = event.target;
    carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    if (!carrito.includes(boton.dataset.id)) {
        carrito.push(boton.dataset.id);
        localStorage.setItem("carrito", JSON.stringify(carrito));
    }
}

function filtrar_categoria() {
    document.querySelectorAll('input[name="categoria"]').forEach(input => {
        input.addEventListener("change", () => {
            tabla.draw();
        });
    });
}