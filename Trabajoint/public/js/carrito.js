const obtenerElementos = () => {

    const elementosproductoCarrito = document.querySelectorAll('.productoCarrito');

    elementosproductoCarrito.forEach((productoCarrito) => {

        const input = productoCarrito.querySelector('.cantidad');

        const botonDecrementar = productoCarrito.querySelector('.btnDecrementar');

        const botonIncrementar = productoCarrito.querySelector('.btnIncrementar');

        const spanPrecio = productoCarrito.querySelector('.precio');

        const botonEliminar = productoCarrito.querySelector('.btnEliminar');

        const spanCantidadTotal = document.querySelector('.cantidadTotal');

        const spanPrecioTotal = document.querySelector('.precioTotal');

        const deshabilitarBotones = () => {

            botonDecrementar.disabled = true;
            botonIncrementar.disabled = true;
            setTimeout(() => {
                botonDecrementar.disabled = false;
                botonIncrementar.disabled = false;
            }, 1000);
        };

        botonDecrementar.addEventListener('click', async () => {
            const valorActual = parseInt(input.value);
            if(valorActual > 1){
            input.value = valorActual - 1;
            const producto = {
                id: parseInt(productoCarrito.id),
                cantidad: valorActual - 1
            }

            const respuesta = await modificarCantidad(producto);

            spanPrecio.textContent = (respuesta.nuevoPrecio).toFixed(2);

            spanCantidadTotal.textContent = respuesta.cantidadTotal;

            spanPrecioTotal.textContent = (respuesta.precioTotal).toFixed(2);

            deshabilitarBotones();
            }
        });

        botonIncrementar.addEventListener('click', async () => {
            const valorActual = parseInt(input.value);
            if(valorActual < 10){
            input.value = valorActual + 1;
            const producto = {
                id: parseInt(productoCarrito.id),
                cantidad: valorActual + 1
            }

            const respuesta = await modificarCantidad(producto);

            spanPrecio.textContent = (respuesta.nuevoPrecio).toFixed(2);

            console.log(respuesta.cantidadTotal);

            console.log(respuesta.precioTotal);

            spanCantidadTotal.textContent = respuesta.cantidadTotal;

            spanPrecioTotal.textContent = (respuesta.precioTotal).toFixed(2);

            deshabilitarBotones();
            }
        });

        botonEliminar.addEventListener('click', async () => {

            const producto = {
                id: parseInt(productoCarrito.id)
            }

            const respuesta = await eliminarProducto(producto);

            if (respuesta.eliminado){

                spanCantidadTotal.textContent = respuesta.cantidadTotal;

                spanPrecioTotal.textContent = (respuesta.precioTotal).toFixed(2);

                productoCarrito.remove();

            }else{
                console.log("No se pudo eliminar el producto");
            }
        });


    });

    const btnComprar = document.querySelector('.btnComprar');

    btnComprar.addEventListener('click', async () => {

        const respuesta = await comprarCarrito();


        if (respuesta.compraRealizada){

            window.alert("Compra realizada exitosamente");

            window.location.href = "http://localhost:3000/";

        }else{
            window.alert("No se pudo realizar la compra");
        }

    });

};

const verificarContenido = () => {

    const elementosproductoCarrito = document.querySelectorAll('.productoCarrito');

    if (elementosproductoCarrito.length > 0) {

        obtenerElementos();

    }else{

        window.alert("No hay productos en el carrito");

        window.location.href = "http://localhost:3000/";

    }
};

verificarContenido();