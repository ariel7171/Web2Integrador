function obtenerProductos() {

    let productos = localStorage.getItem('carrito');

    if (!productos) {
        productos = [];

        localStorage.setItem('carrito', JSON.stringify(productos));
    } else {

        productos = JSON.parse(productos);
    }

    return productos;
}

function guardarProductos(productos) {
    localStorage.setItem('carrito', JSON.stringify(productos));
    console.log(productos);
}


async function enviarProducto(producto) {
    try {
        const response = await fetch('http://localhost:3000/carrito/provisorio', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(producto)
        });

        if (!response.ok) {
            throw new Error('Error al enviar el fetch ' + response.statusText);
        }
        
        const responseData = await response.json();
        return responseData;
        
    } catch (error) {
        console.error('Error:', error);
    }
}

async function modificarCantidad(producto) {
    try {
        const response = await fetch('http://localhost:3000/carrito/cantidad', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(producto)
        });

        if (!response.ok) {
            throw new Error('Error al enviar el fetch ' + response.statusText);
        }
        
        const responseData = await response.json();
        return responseData;
        
    } catch (error) {
        console.error('Error:', error);
    }
}

async function eliminarProducto(producto) {
    try {
        const response = await fetch('http://localhost:3000/carrito/eliminar', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(producto)
        });

        if (!response.ok) {
            throw new Error('Error al enviar el fetch ' + response.statusText);
        }
        
        const responseData = await response.json();
        return responseData;
        
    } catch (error) {
        console.error('Error:', error);
    }
}

async function comprarCarrito() {
    try {
        const response = await fetch('http://localhost:3000/carrito/comprar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({compraRealizada: true})
        });

        if (!response.ok) {
            throw new Error('Error al enviar el fetch ' + response.statusText);
        }
        
        const responseData = await response.json();
        return responseData;
        
    } catch (error) {
        console.error('Error:', error);
    }
}