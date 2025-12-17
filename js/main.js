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
    user = localStorage.getItem("user")

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
            if (producto.idUser !== user) {
                generar_fila_producto(producto, "body");
            }
        })

        /*Inicializar la tabla */
        tabla_productos = new DataTable("#table", {
            info: false,
            pageLength: 10,
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
        console.log("carrito vacio");
        const tabla = document.getElementById("table_carrito");
    
        if (tabla) {
            tabla.style.display = "none";
        }
    
    const mensaje = document.createElement("p");
    mensaje.innerText = "El carrito está vacío.";
    mensaje.classList.add("fs-4", "text-muted");
    const contenedorMensaje = document.getElementById("mensaje_carrito_vacio");
    contenedorMensaje.appendChild(mensaje);
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
            pageLength: 10,
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

function mis_productos() {
    token = localStorage.getItem("token")
    email = localStorage.getItem("email")

    fetch("https://practicaprogramacionweb.duckdns.org/products", {
        method: 'GET',
        headers: {
            "accept": "/",
            "Authorization": `Bearer ${token}`,
        },
    })

    .then(response => response.json())

    .then(productos_json => {
        productos_usuario = productos_json.filter(producto => producto.idUser == email);
        console.log(productos_usuario)
        
        if (productos_usuario.length == 0) {
            const tabla = document.getElementById("table_mis_productos");
            if (tabla) {
                tabla.style.display = "none";
            }
            const mensaje = document.getElementById("no_productos");
            mensaje.style.display = "block";
            return;
        }

        productos_usuario.forEach(producto => {
            generar_fila_producto(producto, "body_mis_productos");
        });


        /*Inicializar la tabla */
        tabla_mis_productos = new DataTable("#table_mis_productos", {
            info: false,
            pageLength: 10,
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
        buscador = document.getElementById("buscador_mis_productos");
        ordenar_precio = document.getElementById("orden_precio_mis_productos");

        filtrar_categoria(tabla_mis_productos);
        searcher(tabla_mis_productos, buscador);
        ordenar(tabla_mis_productos, ordenar_precio);
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
    
    borrar = null;

    if (body == "body_carrito") {
        borrar = document.createElement("button");
        borrar.classList.add("btn", "boton");
        borrar.style.backgroundColor = "red"
        borrar.dataset.id = id;
        borrar.textContent = "Quitar";
        borrar.addEventListener("click", eliminar_del_carrito); 

        boton = document.createElement("button");
        boton.classList.add("btn", "boton");
        boton.dataset.id = id;
        boton.textContent = "Comprar";
        boton.addEventListener("click", comprar);
    }
    else if (body == "body") {
        boton = document.createElement("button");
        boton.classList.add("btn", "boton");
        boton.dataset.id = id;
        boton.textContent = "Añadir al carrito";
        boton.addEventListener("click", añadir_carrito);
    }
    else {
        borrar = document.createElement("button");
        borrar.classList.add("btn", "boton");
        borrar.style.backgroundColor = "red"
        borrar.dataset.id = id;
        borrar.textContent = "Eliminar";
        borrar.addEventListener("click", eliminar_producto); 

        boton = document.createElement("button");
        boton.classList.add("btn", "boton");
        boton.dataset.id = id;
        boton.textContent = "Editar producto";
        boton.addEventListener("click", () => {
            window.location.href = `editar_producto.html?id=${id}`
        });
    }

    if (estado !== "En venta") {
        boton.disabled = true;
        boton.style.backgroundColor = "gray";
        boton.textContent = "No disponible";
    }

    descripcion.appendChild(boton);
    if (borrar){
    descripcion.appendChild(borrar);
    }

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

/*Añadir un producto al carrito*/
function añadir_carrito(event) {
    const boton = event.target;
    carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    if (!carrito.includes(boton.dataset.id)) {
        carrito.push(boton.dataset.id);
        localStorage.setItem("carrito", JSON.stringify(carrito));
    }
}

/*Eliminar un producto del carrito*/
function eliminar_del_carrito(param) {

    if (param instanceof Event) {
        // Si es un Event, obtenemos el id del botón
        const boton = param.target;
        productoId = boton.dataset.id;
    } 
    else {
        // Si no, asumimos que es el id directamente
        productoId = param;
    }

    carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    if (carrito.includes(boton.dataset.id)) {
        carrito = carrito.filter(id => id !== boton.dataset.id);
        localStorage.setItem("carrito", JSON.stringify(carrito));
    }
    location.reload();
}

function filtrar_categoria(tabla) {
    document.querySelectorAll('input[name="categoria"]').forEach(input => {
        input.addEventListener("change", () => {
            tabla.draw();
        });
    });
}

function comprar(event) {
    const boton = event.target;
    console.log(boton.dataset.id)
    fetch(`https://practicaprogramacionweb.duckdns.org/products/buy/${boton.dataset.id}`, {
        method: 'POST',
            headers: {
                "accept": "/",
                "Authorization": `Bearer ${token}`,
            },
})
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error al comprar el producto con id ${boton.dataset.id}.`);
            }
        eliminar_del_carrito(boton.dataset.id);
        location.reload();
    });
}

function editar_producto() {
    token = localStorage.getItem("token")
    id = new URLSearchParams(window.location.search).get("id")

    fetch(`https://practicaprogramacionweb.duckdns.org/products/${id}`, {
            method: 'GET',
            headers: {
                "accept": "/",
                "Authorization": `Bearer ${token}`,
            },
        })

        .then(response => {
            if (!response.ok) {
                throw new Error(`El producto con id ${id} no se encuentra.`);
            }
            return response.json();
        })

        .then(producto => {
                nombre = producto.name
                precio = producto.price
                categoria = producto.category
                imagen = producto.image

                document.getElementById("id_producto").value = id
                document.getElementById("name").value = nombre
                document.getElementById("price").value = precio
                document.getElementById("categoria").value = categoria
                document.getElementById("image").value = imagen
            })

        
}

function editar() {
    token = localStorage.getItem("token")
    
    precio = parseFloat(document.getElementById("price").value)
    nombre = document.getElementById("name").value
    categoria = document.getElementById("categoria").value
    image = document.getElementById("image").value
    email = localStorage.getItem("email")
    id = document.getElementById("id_producto").value
    fetch(`https://practicaprogramacionweb.duckdns.org/products/${id}`, {
            method: 'PUT',
            headers: {
                "accept": "/",
                "content-type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ "name": nombre, "price": precio, "category": categoria, "image": image, "idUser": email })
        })
        .then(response => {
            if (!response.ok) {
                document.getElementById("error_msg").style.display = "block";
                document.getElementById("error_msg").textContent = "Error al editar el producto.";
                return; 
            }
            window.location.href = `mis_productos.html`;
        });
}

function crear() {
    token = localStorage.getItem("token")
    precio = parseFloat(document.getElementById("price").value)
    nombre = document.getElementById("name").value
    categoria = document.getElementById("categoria").value
    image = document.getElementById("image").value
    email = localStorage.getItem("email")

    fetch("https://practicaprogramacionweb.duckdns.org/products", {
            method: 'POST',
            headers: {
                "accept": "/",
                "content-type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ "name": nombre, "price": precio, "category": categoria, "image": image, "idUser": email })
        })

        .then(response => {
            if (!response.ok) {
                document.getElementById("error_msg").style.display = "block";
                document.getElementById("error_msg").textContent = "Error al crear el producto.";
                return; 
            }
            window.location.href = `mis_productos.html`;
        });
}

function eliminar_producto(event) {
    const boton = event.target;
    productoId = boton.dataset.id;
    token = localStorage.getItem("token")

    fetch(`https://practicaprogramacionweb.duckdns.org/products/${productoId}`, {
            method: 'DELETE',
            headers: {
                "accept": "/",
                "Authorization": `Bearer ${token}`,
            },
        })

        .then(response => {
            if (!response.ok) {
                document.getElementById("error_msg").style.display = "block";
                document.getElementById("error_msg").textContent = "Error al aleminar el producto.";
                return; 
            }
            window.location.href = `mis_productos.html`;
        });
    }