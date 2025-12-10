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
                col_nombre.textContent = nombre
                col_precio.textContent = precio

                descripcion.innerHTML = `
                    ${nombre}<br>
                    Precio: ${precio}<br>
                    Categoria: ${categoria}<br>
                    Estado: ${estado}<br>
                    <button class="btn btn-primary boton_carrito" data-id="${id}" onclick="añadir_carrito(event)">Añadir al carrito</button>`

                const boton_carrito = descripcion.querySelector(".boton_carrito");

                if (estado !== "En venta") {
                    boton_carrito.disabled = true;
                    boton_carrito.style.backgroundColor = "gray";
                    boton_carrito.innerText = "No disponible";
                }

                tr.appendChild(imagen)
                tr.appendChild(descripcion)
                tr.appendChild(col_nombre)
                tr.appendChild(col_precio)
                tbody.appendChild(tr)
            })

            new DataTable("#table",{
                columnDefs: [
                    {targets: [2,3], visible: false},
                    {targets: [2], searchable: true},
                    {targets: [3], orderable: true},
                    {targets: [1], orderData: [3]},
                ]
            })    
        })
}

document.addEventListener("DOMContentLoaded", productos);


function añadir_carrito(event) {
    const boton = event.target;
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    if (!carrito.includes(boton.dataset.id)) {
        carrito.push(boton.dataset.id);
        localStorage.setItem("carrito", JSON.stringify(carrito));
    }
}
