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

            table = document.getElementById("table")
            productos_json.forEach(producto => {

                nombre = producto.name
                precio = producto.price
                categoria = producto.category
                image = producto.image
                usuario = producto.idUser

                tr = document.createElement("tr")
                imagen = document.createElement("td")
                imagen.innerHTML = `<img src="${image}">`
                descripcion = document.createElement("td")
                
                descripcion.innerHTML = `
                    ${nombre}<br>
                    Precio: ${precio}<br>
                    Categoria:${categoria}<br>`;

                tr.appendChild(imagen)
                tr.appendChild(descripcion)
                table.appendChild(tr)
            })
            new DataTable("#table")
        })
}

document.addEventListener("DOMContentLoaded", productos);
