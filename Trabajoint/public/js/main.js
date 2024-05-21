
const elementosDescripcion = document.querySelectorAll('.descripcion');

elementosDescripcion.forEach((span) => {

    span.addEventListener('mouseover', (e) => {
        e.target.className = 'tooltip descripcion';
    });

    span.addEventListener('mouseout', (e) => {
        e.target.className = 'texto-recortado descripcion';
    });
});

const btnsAgregar = document.querySelectorAll('.btn-agregar');

btnsAgregar.forEach((btn) => {

    btn.addEventListener('click', async (e) => {

        console.log("boton clickeado");

        //let productos = obtenerProductos();

        //let producto = productos.find(producto => producto.id === e.target.id);

        if (!e.target.classList.contains('agregado')) {

            const producto = {
                id: parseInt(e.target.id),
                cantidad: 1
            };

            e.target.textContent = 'Agregado';
            e.target.classList.add('agregado');
            //guardarProductos(productos)
            await enviarProducto(producto);
        }

    })
});