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

        productos_json.forEach(producto => {
        generar_fila_producto(producto, "body");
        })

        /*Inicializar la tabla */
        tabla_productos = new DataTable("#table", {
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
        buscador = document.getElementById("buscador_productos");
        ordenar_precio = document.getElementById("orden_precio_productos");

        filtrar_categoria(tabla_productos);
        searcher(tabla_productos, buscador);
        ordenar(tabla_productos, ordenar_precio);
    });
}

function carrito() {
    productos_carrito = JSON.parse(localStorage.getItem("carrito"))
    console.log(productos_carrito)
    token = localStorage.getItem("token")

    if (productos_carrito == null || productos_carrito.length == 0) {
        console.log("carrito vacio")
        return;
    }

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
            return response.json();
        })

        .then(producto => {
                tbody = document.getElementById("body_carrito")

                generar_fila_producto(producto, "body_carrito");
            })

        .catch(error => {
            console.error('Error al obtener el producto:', error);
            productos_carrito = productos_carrito.filter(f => f !== producto_id);
            localStorage.setItem("carrito", JSON.stringify(productos_carrito));
        })
    );

    /* Esperar a que todas las promesas terminen*/
    Promise.all(fetches).then(productos => {
        const tbody = document.getElementById("body_carrito");

        /*Inicializamos DataTable **solo después de agregar todas las filas*/
        tabla_carrito  = new DataTable("#table_carrito", {
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
        buscador = document.getElementById("buscador_carrito");
        ordenar_precio = document.getElementById("orden_precio_carrito");

        filtrar_categoria(tabla_carrito);
        searcher(tabla_carrito, buscador);
        ordenar(tabla_carrito, ordenar_precio);
    });
}

function generar_fila_producto(producto, body) {
    tbody = document.getElementById(body)
    
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
    
    if (body == "body") {
    boton = document.createElement("button");
    boton.classList.add("btn", "btn-primary", "boton_carrito");
    boton.dataset.id = id;
    boton.textContent = "añadir al carrito";
    boton.addEventListener("click", añadir_carrito);
    }
    else {
    boton = document.createElement("button");
    boton.classList.add("btn", "btn-primary", "boton_comprar");
    boton.dataset.id = id;
    boton.textContent = "Comprar";
    boton.addEventListener("click", comprar);
    }
    if (estado !== "En venta") {
        boton.disabled = true;
        boton.style.backgroundColor = "gray";
        boton.textContent = "No disponible";
    }

    descripcion.appendChild(boton);

    tr.appendChild(imagen);
    tr.appendChild(descripcion);
    tr.appendChild(col_nombre);
    tr.appendChild(col_precio);
    tr.appendChild(col_categoria);
    tbody.appendChild(tr);
}

function searcher(tabla, buscador) {
    /*Convertir mi input en el buscador de data tables*/

    buscador.addEventListener("input", function() {
        tabla.column(2).search(this.value).draw();
    });
}

function ordenar(tabla, ordenar_precio) {
    /*Al pulsar el boton ordenar por precio ordena la tabla ascendente o descendente*/
    
    asc = true
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

function comprar(event) {
    return;
}