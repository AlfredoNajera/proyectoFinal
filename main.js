// Cargamos modulos
const fs = require('fs');
const express = require('express');
const app = express();

// Mandamos mensaje de que estamos conectando
app.listen(3000, () => {
    console.log('Conectando');
})

// Vemos lista de productos con una ruta específica para ellos
app.get('/productos', (req, res) => {
    let data = fs.readFileSync('./productos.txt', 'utf8');
    let productos = JSON.parse(data);
    res.send(productos);
})

//Buscamos productos de acuerdo al campo escogido
app.get('/productos/:filtro/:clave', (req, res) => {
    let filtro = req.params.filtro
    let clave = req.params.clave;
    let data = fs.readFileSync('./productos.txt', 'utf8');

    let productos = JSON.parse(data);
    let consulta = productos.filter(product => product[filtro] === clave);

    res.send(consulta);
})

//Mostramos el contenido del carrito
app.get('/carro', (req, res) => {
    let datos_carro = fs.readFileSync('./carro.txt', 'utf8');
    let carro_productos = JSON.parse(datos_carro);
    res.send(carro_productos);
})

// Vaciamos el carro
app.delete('/carro', (req, res) => {
    fs.writeFileSync('./carro.txt', '[]');
    res.send('carro vacío');
})

// Añadimos todos los datos del producto en forma de "json"
app.post('/carro/productos/:producto', (req, res) => {
    let datos_carro = fs.readFileSync('./carro.txt', 'utf8');
    let carro_productos = JSON.parse(datos_carro);
    
    let nombre_producto = JSON.parse(req.params.producto);
    const indice = carro_productos.findIndex(producto => producto.id === nombre_producto.id);

    // Con esta condición verificamos si ya existe en el carro
    if(indice === -1){
        carro_productos.push(nombre_producto);
    }else{
        carro_productos.splice(indice, 1, nombre_producto);
    }

    // Escribimos en nuestro archivo que guarda los productos del carro
    fs.writeFileSync('./carro.txt', '');
    fs.writeFileSync('./carro.txt', JSON.stringify(carro_productos)); 

    res.send('Productos añadidos al carrito');
})

// Actualizamos los datos del carrito
app.put('/carro/productos/:id/:cantidad', (req, res) => {
    let datos_carro = fs.readFileSync('./carro.txt', 'utf8');
    let carro_productos = JSON.parse(datos_carro);
    
    let cant = parseInt(req.params.cantidad);
    let id_producto = parseInt(req.params.id);

    // Obtenemos los datos de coincidencia
    const indice = carro_productos.findIndex(producto => producto.id === id_producto);
    const coincidencia = carro_productos[indice];

    coincidencia.cantidad = cant;

    carro_productos.splice(indice, 1, coincidencia);

    fs.writeFileSync('./carro.txt', '');
    fs.writeFileSync('./carro.txt', JSON.stringify(carro_productos));
    res.send('Productos del carrito actualizados');
})

// Borramos un producto en específico del carrito
app.delete('/carro/productos/:id/', (req, res) => {
    let datos_carro = fs.readFileSync('./carro.txt', 'utf8');
    let carro_productos = JSON.parse(datos_carro);
    
    let id_producto = parseInt(req.params.id);

    // Obtenemos el índice
    const indice = carro_productos.findIndex(producto => producto.id === id_producto);

    carro_productos.splice(indice, 1);

    fs.writeFileSync('./carro.txt', '');
    fs.writeFileSync('./carro.txt', JSON.stringify(carro_productos));
    res.send('Producto eliminado del carrito');
})

// Actualizamos la cantidad y verificamos que no exceda de lo disponible
app.post('/verificar', (req, res) => {
    let mensaje = '';
    let total = 0;
    let bandera = 0;
    let datos_carro = fs.readFileSync('./carro.txt', 'utf8');
    let carro_productos = JSON.parse(datos_carro);

    let data = fs.readFileSync('./productos.txt', 'utf8');
    let productos = JSON.parse(data);

    // Verificamos si la cantidad que hay en el carrito no supera la de nuestro inventario
    carro_productos.forEach(producto1 => {
        let indice = productos.findIndex(producto2 => producto2.id === producto1.id)
        total += productos[indice].precio * producto1.cantidad;
        if(producto1.cantidad > productos[indice].cantidad){
            bandera = 1;
        }
    });
    
    // Verificamos que efectivamente los productos existentes cubran los productos en carrito
    if(bandera === 0){
        
        carro_productos.forEach(producto1 => {
            let indice = productos.findIndex(producto2 => producto2.id === producto1.id)
            productos[indice].cantidad -= producto1.cantidad;
        });

        mensaje = 'El total es: ' + total;
        fs.writeFileSync('./carro.txt', '[]');
        fs.writeFileSync('./productos.txt', '');
        fs.writeFileSync('./productos.txt', JSON.stringify(productos));

    }else{
        mensaje = '¡Error! Uno o más productos superan la cantidad del inventario'
    }
    
    res.send(mensaje);
})