
const express = require("express");
const app = express();
const translate = require('node-google-translate-skidz');
const fetch = require('node-fetch');
const fs = require('fs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'pug');

const obtenerProductos = async () => {
    try {
        /*
        const response = await fetch('https://fakestoreapi.com/products');
        
        if (!response.ok) {
            throw new Error('La solicitud no fue exitosa');
        }

        let productos = await response.json();
        */

        const data = await fs.promises.readFile('data/data.json', 'utf8');
        const productos = JSON.parse(data);

        for (let producto of productos) {

            let traduccion;

            traduccion = await translate({
                text: producto.title,
                source: 'en',
                target: 'es'
            });

            producto.title = traduccion.translation;

            traduccion = await translate({
                text: producto.description,
                source: 'en',
                target: 'es'
            });

            producto.description = traduccion.translation;

        }

        await fs.promises.writeFile('data/productosTraducidos.json', JSON.stringify(productos, null, 2));

    } catch (error) {
        console.error('Error al obtener los productos:', error);
    }
};


const procesarProductos = async () => {
    try {
        let data = await fs.promises.readFile('data/productosTraducidos.json', 'utf8');

        if (!data) {
            await obtenerProductos();
            data = await fs.promises.readFile('data/productosTraducidos.json', 'utf8');
        }

        const productos = JSON.parse(data);

        const descuentosData = await fs.promises.readFile('data/descuentos.json', 'utf8');

        const descuentos = JSON.parse(descuentosData);

        const data2 = await fs.promises.readFile('data/carritoProvisorio.json', 'utf8');

        const carritoProvisorio = JSON.parse(data2);

        const arrayCarritoProvisorio = carritoProvisorio.productos;

        for (let producto of productos) {

            producto.price = parseFloat(producto.price.toFixed(2));

            const desc = descuentos.find(d => d.id === producto.id);

            if (desc) {
                producto.oferta = {
                    descuento: desc.descuento,
                    precioDesc: parseFloat((producto.price - producto.price * desc.descuento / 100).toFixed(2))
                };
            }

            const productoCarrito = arrayCarritoProvisorio.find(item => item.id === producto.id)

            if (productoCarrito) {

                let precioUnidad;

                if (producto.oferta) {
                    precioUnidad = producto.oferta.precioDesc;
                } else {
                    precioUnidad = producto.price;
                }

                producto.agregado = {
                    cantidad: productoCarrito.cantidad,
                    precio: parseFloat((precioUnidad * productoCarrito.cantidad).toFixed(2))
                };
            }
        }

        return productos;
    } catch (error) {
        console.error('Error al obtener los productos:', error);
    }

};

app.get('/', async (req, res) => {
    try {

        const productos = await procesarProductos();

        res.render('main', { productos: productos });

    } catch (error) {
        console.error('Error al manejar la solicitud:', error);
        res.status(500).send('Error interno del servidor');
    }
});

app.get('/carrito', async (req, res) => {
    try {

        const productos = await procesarProductos();

        const data = await fs.promises.readFile('data/carritoProvisorio.json', 'utf8');

        const carritoProvisorio = JSON.parse(data);

        const totalesCarritoProvisorio = {
            cantidadTotal: carritoProvisorio.cantidadTotal,
            precioTotal: carritoProvisorio.precioTotal
        };

        res.render('carrito', { productos: productos, totales: totalesCarritoProvisorio });

    } catch (error) {
        console.error('Error al manejar la solicitud:', error);
        res.status(500).send('Error interno del servidor');
    }
});

app.post('/carrito/provisorio', async (req, res) => {
    try {
        const productoRecibido = req.body;

        if (productoRecibido) {

            let data = await fs.promises.readFile('data/carritoProvisorio.json', 'utf8');

            if (!data) {

                const valoresIniciales = {
                    id: 0,
                    cantidadTotal: 0,
                    precioTotal: 0,
                    productos: []
                };

                await fs.promises.writeFile('data/carritoProvisorio.json', JSON.stringify(valoresIniciales, null, 2));

                data = await fs.promises.readFile('data/carritoProvisorio.json', 'utf8');

            }

            const carritoProvisorio = JSON.parse(data);

            const arrayCarritoProvisorio = carritoProvisorio.productos;

            arrayCarritoProvisorio.push(productoRecibido);  //listaTemp = listaTemp.concat(listacarrito.lista);

            await fs.promises.writeFile('data/carritoProvisorio.json', JSON.stringify(carritoProvisorio, null, 2));

            const productosProcesados = await procesarProductos();

            const productoProcesado = productosProcesados.find(producto => producto.id === productoRecibido.id);

            const productoCarritoProvisorio = arrayCarritoProvisorio.find(producto => producto.id === productoRecibido.id);

            if (productoProcesado) {
                productoCarritoProvisorio.precio = productoProcesado.agregado.precio;
            }

            carritoProvisorio.cantidadTotal = arrayCarritoProvisorio.reduce((acumulador, producto) => acumulador + producto.cantidad, 0);

            carritoProvisorio.precioTotal = parseFloat((arrayCarritoProvisorio.reduce((acumulador, producto) => acumulador + producto.precio, 0)).toFixed(2));

            await fs.promises.writeFile('data/carritoProvisorio.json', JSON.stringify(carritoProvisorio, null, 2));

            res.status(200).send({ message: 'Carrito provisorio actualizado exitosamente' });
        } else {
            res.status(400).send({ message: 'No se recibio el producto' });
        }
    } catch (error) {
        console.error('Error al manejar la solicitud:', error);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
});

app.patch('/carrito/cantidad', async (req, res) => {
    try {
        const productoRecibido = req.body;

        if (productoRecibido) {

            const data = await fs.promises.readFile('data/carritoProvisorio.json', 'utf8');

            const carritoProvisorio = JSON.parse(data);

            const arrayCarritoProvisorio = carritoProvisorio.productos;

            const productoCarritoProvisorio = arrayCarritoProvisorio.find(producto => producto.id === productoRecibido.id);

            if (productoCarritoProvisorio) {
                productoCarritoProvisorio.cantidad = productoRecibido.cantidad;
            }

            await fs.promises.writeFile('data/carritoProvisorio.json', JSON.stringify(carritoProvisorio, null, 2));

            const productosProcesados = await procesarProductos();

            const productoProcesado = productosProcesados.find(producto => producto.id === productoRecibido.id);

            if (productoProcesado) {
                productoCarritoProvisorio.precio = productoProcesado.agregado.precio;
            }

            carritoProvisorio.cantidadTotal = arrayCarritoProvisorio.reduce((acumulador, producto) => acumulador + producto.cantidad, 0);

            carritoProvisorio.precioTotal = parseFloat((arrayCarritoProvisorio.reduce((acumulador, producto) => acumulador + producto.precio, 0)).toFixed(2));

            await fs.promises.writeFile('data/carritoProvisorio.json', JSON.stringify(carritoProvisorio, null, 2));

            res.status(200).send({
                message: 'Carrito provisorio actualizado exitosamente',
                nuevoPrecio: productoProcesado.agregado.precio,
                cantidadTotal: carritoProvisorio.cantidadTotal,
                precioTotal: carritoProvisorio.precioTotal
            });
        } else {
            res.status(400).send({ message: 'No se recibio el producto' });
        }
    } catch (error) {
        console.error('Error al manejar la solicitud:', error);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
});

app.delete('/carrito/eliminar', async (req, res) => {
    try {
        const productoRecibido = req.body;

        if (productoRecibido) {

            const data = await fs.promises.readFile('data/carritoProvisorio.json', 'utf8');

            const carritoProvisorio = JSON.parse(data);

            const arrayCarritoProvisorio = carritoProvisorio.productos;

            const productoEliminado = arrayCarritoProvisorio.find(producto => producto.id === productoRecibido.id);

            if (productoEliminado) {
                arrayCarritoProvisorio.splice(arrayCarritoProvisorio.indexOf(productoEliminado), 1);
            }

            carritoProvisorio.cantidadTotal = arrayCarritoProvisorio.reduce((acumulador, producto) => acumulador + producto.cantidad, 0);

            carritoProvisorio.precioTotal = parseFloat((arrayCarritoProvisorio.reduce((acumulador, producto) => acumulador + producto.precio, 0)).toFixed(2));

            await fs.promises.writeFile('data/carritoProvisorio.json', JSON.stringify(carritoProvisorio, null, 2));

            res.status(200).send({
                message: 'Carrito provisorio actualizado exitosamente',
                eliminado: true,
                cantidadTotal: carritoProvisorio.cantidadTotal,
                precioTotal: carritoProvisorio.precioTotal
            });
        } else {
            res.status(200).send({
                message: 'Error al intentar eliminar el producto',
                eliminado: false
            });

        }
    } catch (error) {
        console.error('Error al manejar la solicitud:', error);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
});

app.post('/carrito/comprar', async (req, res) => {
    try {
        const compra = req.body;

        if (compra) {

            const data = await fs.promises.readFile('data/carritoProvisorio.json', 'utf8');

            const carritoProvisorio = JSON.parse(data);

            const data2 = await fs.promises.readFile('data/compras.json', 'utf8');

            const compras = JSON.parse(data2);

            if (compras.length > 0) {

                const idNuevaCompra = Math.max(...compras.map(compra => compra.id)) + 1;

                carritoProvisorio.id = idNuevaCompra

            }

            compras.push(carritoProvisorio);

            await fs.promises.writeFile('data/compras.json', JSON.stringify(compras, null, 2));

            const carritoProvisorioVacio = {
                id: 0,
                cantidadTotal: 0,
                precioTotal: 0,
                productos: []
            }

            await fs.promises.writeFile('data/carritoProvisorio.json', JSON.stringify(carritoProvisorioVacio, null, 2));

            res.status(200).send({
                message: 'Compra realizada',
                compraRealizada: true
            });
        } else {
            res.status(400).send({
                message: 'No se realizo la compra',
                compraRealizada: false
            });
        }
    } catch (error) {
        console.error('Error al manejar la solicitud:', error);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
});

app.listen(3000, () => {
    console.log("Servidor iniciado");
    //await obtenerProductos();
});


