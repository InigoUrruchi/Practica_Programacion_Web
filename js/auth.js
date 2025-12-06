function iniciar_sesion(event) {
    if (event) event.preventDefault();
    email = document.getElementById("email").value
    password = document.getElementById("contraseña").value

    fetch("https://practicaprogramacionweb.duckdns.org/auth/login", {
        method: 'POST',
        headers: {
            "accept": "/",
            "content-type": "application/json"
        },
        body: JSON.stringify({ email: email, password: password })
    })

        .then(response => {
            if (!response.ok) {
                console.log("Error en la petición: " + response.status)
            }
            return response.json()
        })

        .then(data => {
            console.log(data)
            localStorage.setItem("token", data.access_token)
            localStorage.setItem("email", email)
            localStorage.setItem("user", data.user)
            console.log(localStorage)

            window.location.href = "productos.html"
        })
}

function registrar(event) {
    errores = false

    if (event) event.preventDefault()
    user = document.getElementById("usuario").value
    email = document.getElementById("email").value
    password = document.getElementById("contraseña").value
    confirmacion = document.getElementById("confirmacion").value
    coordenadas = document.getElementById("coordenadas").value

    lat =   parseFloat(coordenadas.split(",")[0])
    lon =   parseFloat(coordenadas.split(",")[1])

    function validar_coordenadas() {
        const regex = /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/
        return regex.test(coordenadas)
    }

    function validar_correo() {
        const regex = /^[a-z0-9]+[@]+[a-z]+[.]+[a-z]+$/
        return regex.test(email)
    }

    function validar(id, invalido) {
        document.getElementById(id).classList.toggle("is-invalid", invalido)
        if (invalido) errores = true
    }

    validar("usuario", !user);
    validar("email", !validar_correo())
    validar("contraseña", password.length < 6)
    validar("coordenadas", !validar_coordenadas())
    validar("confirmacion", password != confirmacion)

    if (!errores) {
        fetch("https://practicaprogramacionweb.duckdns.org/users/register", {
            method: 'POST',
            headers: {
                "accept": "/",
                "content-type": "application/json"
            },
            body: JSON.stringify({ username: user, email: email, password: password, latitude: lat, longitude: lon })
        })

            .then(response => {
                if (!response.ok) {
                    throw console.log("Error en la petición: " + response.message)
                }
                return response.json()
            })
    }
}