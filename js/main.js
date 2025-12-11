window.addEventListener("DOMContentLoaded", () => {
    fetch("navbar.html")
        .then(res => res.text())
        .then(html => {
            document.getElementById("navbar-container").innerHTML = html;
        })
});


/*Crear el filtro por categorias*/
$.fn.dataTable.ext.search.push(function (settings, data) {

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
        generar_fila_producto(producto, tbody);
        })

        /*Inicializar la tabla */
        tabla = new DataTable("#table", {
            info: false,
            pageLength: 25,
            lengthChange: false,
            responsive: true,
            columnDefs: [
                { targets: 2, visible: false, searchable: true },
                { targets: 3, visible: false, orderable: true },
                { targets: 4, visible: false },
                { targets: 1, orderData: [3] },
                { targets: 0, orderable: false },
            ]
        })

        filtrar_categoria(tabla);
        searcher(tabla);
        ordenar(tabla)
    });
}

function carrito() {
    productos_carrito = JSON.parse(localStorage.getItem("carrito"))
    console.log(productos_carrito)
    token = localStorage.getItem("token")
    fetches = productos_carrito.map(producto_id =>
        fetch(`https://practicaprogramacionweb.duckdns.org/products/${producto_id}`, {
            method: 'GET',
            headers: {
                "accept": "/",
                "Authorization": `Bearer ${token}`,
            },
        })

        .then(response => {
            if (!response.ok) {
                throw new Error(`El producto con id ${producto_id} no se encuentra.`);
            }
            if (response.ok) {
                return response.json();
            }
        })

        .then(producto => {
                tbody = document.getElementById("body_carrito")

                generar_fila_producto(producto, tbody);
            })

        .catch(error => {
            console.error('Error al obtener el producto:', error);
            productos_carrito = productos_carrito.filter(f => f !== producto_id);
            return null;
        })
    );

    /* Esperar a que todas las promesas terminen*/
    Promise.all(fetches).then(productos => {
        const tbody = document.getElementById("body_carrito");

        /*Inicializamos DataTable **solo después de agregar todas las filas*/
        tabla2 = new DataTable("#table_carrito", {
            info: false,
            pageLength: 25,
            lengthChange: false,
            responsive: true,
            columnDefs: [
                { targets: 2, visible: false, searchable: true },
                { targets: 3, visible: false, orderable: true },
                { targets: 4, visible: false },
                { targets: 1, orderData: [3] },
                { targets: 0, orderable: false },
            ]
        });

        filtrar_categoria(tabla2);
        searcher(tabla2);
        ordenar(tabla2);
    });
}

function generar_fila_producto(producto, body) {
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
        <p id = "estado_prod">${estado}</p>`
    
    if (body == document.getElementById("body_carrito")) {
        descripcion.innerHTML +=`<button class="btn btn-primary boton_comprar" data-id="${id}" onclick="comprar(event)">Comprar</button>`
    }
    else {
        descripcion.innerHTML +=`<button class="btn btn-primary boton_carrito" data-id="${id}" onclick="añadir_carrito(event)">Añadir al carrito</button>`
    }

    tr.appendChild(imagen);
    tr.appendChild(descripcion);
    tr.appendChild(col_nombre);
    tr.appendChild(col_precio);
    tr.appendChild(col_categoria);
    body.appendChild(tr);
}

function searcher(tabla) {
    /*Convertir mi input en el buscador de data tables*/
    let buscador;
    
    if (tabla == tabla2) {
        buscador = $("#buscador_carrito");
    } else {
        buscador = $("#buscador");
    }

    buscador.on("input", function () {
        tabla.column(2).search(this.value).draw();
    });
}

function ordenar(tabla) {
    /*Al pulsar el boton ordenar por precio ordena la tabla ascendente o descendente*/
    asc = true
    if (tabla == tabla2) {
        ordenar_precio = document.getElementById("ordenPrecio_carrito")
    } 
    else {
        ordenar_precio = document.getElementById("ordenPrecio")
    }

    ordenar_precio.addEventListener("click", () => {
    tabla.order([3, asc ? "asc" : "desc"]).draw();

        /*Alternar icono*/
        ordenar_precio.innerText = asc ? "Precio ↑" : "Precio ↓";

        asc = !asc;
    });
}

function añadir_carrito(event) {
    const boton = event.target;
    carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    if (!carrito.includes(boton.dataset.id)) {
        carrito.push(boton.dataset.id);
        localStorage.setItem("carrito", JSON.stringify(carrito));
    }
}

function filtrar_categoria(tabla) {
    document.querySelectorAll('input[name="categoria"]').forEach(input => {
        input.addEventListener("change", () => {
            tabla.draw();
        });
    });
}