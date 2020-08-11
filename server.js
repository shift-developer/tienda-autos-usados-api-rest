//MODULOS DEL SERVIDOR
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const firma = "15A%97013n8&C3M1#b$438";

//FUNCTIONS
const f = {

    Producto: function(marca, modelo, precio, motor, combustible,
                        kilometros, year, urlPhoto, idVendedor ) {
        this.idVendedor = idVendedor;
        this.id = new Date().getTime();                 
        this.marca = marca;
        this.modelo = modelo;
        this.precio = precio;
        this.motor = motor;
        this.tipoCombustible = combustible;
        this.kilometros = kilometros;
        this.year = year;
        this.urlPhoto = urlPhoto;         
    },

    Usuario: function(email, password, nombre, apellido, fechaDeNac,
                        urlPhoto, nroTelefono, localidad ) {
        this.id = new Date().getTime();
        this.email = email;
        this.password = password;
        this.nombre = nombre;
        this.apellido = apellido;
        this.fechaDeNac = new Date(...fechaDeNac);
        this.urlPhoto = urlPhoto;
        this.nroTelefono = nroTelefono;
        this.localidad = localidad;
        this.user = "vendedor";
        this.productos = [];
    },

    validarLogin(email, pass, data) {

        const validacion = data.find( user => user.email === email && user.password === pass );
    
        if( validacion ) {
            return true;
        } else {
            return false;
        }
    },

    getId(email, data) {
        
        const {id} = data.find( user => user.email === email);

        return id;
    }

};

//MIDDLEWARES
const mid = {

    bodyRegistroUsuario(req, res, next) {
    
        const { nombre, apellido, email, password, 
            fechaDeNac, urlPhoto, nroTelefono, localidad } = req.body;
    
        if ( nombre && apellido && email && password && fechaDeNac 
            && urlPhoto && nroTelefono && localidad) next();
    
        res.status(400).json({error: 'Faltan datos de usuario'});
    
    },

    bodyNuevoProducto(req, res, next) {

        const { marca, modelo, precio, motor, combustible,
            kilometros, year, urlPhoto  } = req.body;

        if(marca && modelo && precio && motor && combustible &&
            kilometros && year && urlPhoto ) next();
        
        res.status(400).json({error: 'Faltan datos de producto'});

    },

    bodyEditUsuario(req, res, next) {
    
        const { nombre, apellido,
            fechaDeNac, urlPhoto, nroTelefono, localidad } = req.body;
    
        if ( nombre && apellido && fechaDeNac 
            && urlPhoto && nroTelefono && localidad) next();
    
        res.status(400).json({error: 'Faltan datos de usuario'});
    
    },

    bodyEditLogUsuario(req, res, next) {
    
        const { email, password } = req.body;
    
        if ( email && password ) next();
    
        res.status(400).json({error: 'Faltan datos de login'});
    
    },


    elUsuarioYaExiste(req, res, next) {

        const { email } = req.body;
    
        const validacion = data.find( a => a.email === email );
    
        if ( !validacion ) next();
    
        res.status(400).json({error: 'El email ya está registrado'});
    
    },

    elMailExiste(req, res, next) {
    
        const { mail } = req.query;
    
        const validacion = data.find( a => a.email === mail );
    
        if ( validacion ) next();
    
        res.status(404).json({error: 'El mail no existe'});
    
    },

    elIdExiste(req, res, next) {
    
        const { id } = req.params;
    
        const validacion = data.find( a => a.id === +id );
    
        if ( validacion ) next();
    
        res.status(404).json({error: 'El id no existe'});
    
    },

    elIdProdExiste(req, res, next) {
    
        const { id } = req.usuario;
        const { idProd } = req.params;
    
        const validacion = data.find( a => a.id === +id ).find( a => a.id === +idProd );
    
        if ( validacion ) next();
    
        res.status(404).json({error: 'El id no existe'});
    
    },


    autenticarUsuario(req, res, next) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const verificarToken = jwt.verify(token, firma);
    
            if(verificarToken) {
                req.usuario = verificarToken;
                return next()
            }
        } 
        catch (err) {
            res.status(401).json({error: 'Error al validar usuario'})
        }
    },

    validarAdmin(req, res, next) {

        const {email} = req.usuario;
    
        const validacion = data.find( usuario => usuario.user === "admin" && usuario.email === email);
    
        if(validacion) next();
    
        res.status(403).send('No estas autorizado para esta petición');
    
    }




}   

//DATA
const data = [
    {
        id: 1597013831438,
        email: "admin@admin.com",
        password: "admin",
        nombre: "Admin",
        user: "admin",
        productos: []
    },
    {
        id: 1597012259647,
        email: "juan@gmail.com",
        password: "123456",
        nombre: "Juan",
        apellido: "Gonzalez",
        fechaDeNac: new Date(1996, 7, 14),
        urlPhoto: "https://avatars2.githubusercontent.com/u/61192769?s=400&u=19b3dfbb0cdb582ed6b83113032b0f07e232b7f6&v=4",
        nroTelefono: "+543516668571",
        localidad: "Córdoba Capital",
        user: "vendedor",
        productos: [
            {
                idVendedor: 1597012259647,
                id: 1597012262938,
                modelo: "Wave 110 s",
                marca: "Honda",
                precio: 80000,
                motor: "110cc",
                tipoCombustible: "nafta",
                kilometros: 4200,
                year: 2019,
                urlPhoto: "https://sistema.autotall.com.ar/site_media/media/motorcycle_pic/motorcycle_dd5340cd-ffc5-477e-9b4e-ee376b98cd43/pic_802174.png",
                vendido: false
            }
        ]
    }
]

app.use(bodyParser.json());

//PUBLIC

app.get('/usuarios/productos', (req, res) => {

    const productos = [];
    data.forEach( usuario => {

        if(usuario.productos.length > 0) {

            usuario.productos.forEach( producto => productos.push(producto));
        }
    });

    res.json(productos);

});

app.get('/usuarios/:id/productos', mid.elIdExiste, (req, res) => {
    
    const { id } = req.params;

    const result = data.find( usuario => usuario.id === +id);

    const productos = [...result.productos];
    

    res.json(productos);

});

app.get( '/usuarios/:id/productos/:idProd', mid.elIdExiste, (req, res) => {

    const { id, idProd } = req.params;

    const usuario = data.find( usuario => usuario.id === +id);
    const producto = usuario.find( producto => producto.id === +idProd);

    if( producto ) res.json(producto);
    res.status(404).send('El id del producto es inexistente');
});

app.get( '/usuarios/:id/perfil', (req, res) => {

    const { id } = req.params;

    const result = data.find( usuario => usuario.id === +id);

    const perfil = {
        id: +id,
        nombre: result.nombre,
        apellido: result.apellido,
        urlPhoto: result.urlPhoto,
        nroTelefono: result.nroTelefono,
        localidad: result.localidad,
        productos: [...result.productos]
    }

    if( result ) res.json(perfil);
    res.status(404).send('El id del usuario es inexistente');
});



//ADMIN
app.get('/usuarios', mid.autenticarUsuario, mid.validarAdmin, (req, res) => {
    res.json(data);
});

app.get( '/usuarios/:id', mid.autenticarUsuario, mid.validarAdmin, (req, res) => {
    const { id } = req.params;

    let result = data.find( usuario => usuario.id === +id);

    if( result ) res.json(result);
    res.status(404).send('No se encontró el usuario, el id no existe');
});

app.delete('/usuarios/:id', mid.autenticarUsuario, mid.elIdExiste, mid.validarAdmin, (req, res)=> {

    const {id} = req.params;

    const idx = data.findIndex( usuario => usuario.id === +id);

    data.splice(idx, 1);
    res.send('Eliminado exitósamente');

});

//REGISTRO Y LOGIN
app.post('/usuarios/registro', mid.bodyRegistroUsuario, mid.elUsuarioYaExiste,  (req, res) => {

    const { nombre, apellido, email, password, 
        fechaDeNac, urlPhoto, nroTelefono, localidad } = req.body;

    const usuario = new f.Usuario(email, password, nombre, apellido, 
                            fechaDeNac, urlPhoto, nroTelefono, localidad);

    data.push(usuario);

    res.status(201).send(`Usuario agregado exitosamente`);
});

app.post('/usuarios/login', (req, res) => {

    const { email, password } = req.body;

    const isLogged = f.validarLogin(email, password, data);

    const id = f.getId(email, data);

    if(isLogged) {
        const token = jwt.sign( {email, id}, firma );
        res.json(token);
    } else {
        res.status(401).json({error: 'El usuario o password no es válido'})
    }
    
});

//GET DATOS USUARIO
app.get( '/usuarios/usuarioautenticado', mid.autenticarUsuario, (req, res) => {

    const { mail, id } = req.usuario;

    let result = data.find( usuario => usuario.email === mail && usuario.id === +id);

    if( result ) res.json(result);
    res.status(401).send('No estás autenticado con este id');
});

app.get('/usuarios/productos', (req, res) => {

    const productos = [];
    data.forEach( usuario => {

        if(usuario.productos.length > 0) {

            usuario.productos.forEach( producto => productos.push(producto));
        }
    });

    res.json(productos);

});

app.post('usuarios/productos', mid.autenticarUsuario, mid.elIdExiste, mid.bodyNuevoProducto, (req, res) => {

    const { id } = req.usuario;
    const { marca, modelo, precio, motor, combustible, kilometros, year, urlPhoto } = req.body;

    const producto = new f.Producto(marca, modelo, precio, motor, combustible, kilometros, year, urlPhoto, id);

    res.status(201).json(producto);

});

app.put('usuarios/productos/:idProd', mid.autenticarUsuario, mid.bodyNuevoProducto, mid.elIdProdExiste, (req, res) => {

    const { id } = req.usuario;
    const { idProd } = req.params;
    const { marca, modelo, precio, motor, combustible, kilometros, year, urlPhoto, vendido } = req.body;

    const usuarioIdx = data.findIndex( usuario => usuario.id === +id );
    const productoIdx = data.find( usuario => usuario.id === +id ).findIndex( producto => producto.id === +idProd );

    const producto = {
        idVendedor: id,
        id: idProd,
        modelo: modelo,
        marca: marca,
        precio: precio,
        motor: motor,
        tipoCombustible: combustible,
        kilometros: kilometros,
        year: year,
        urlPhoto: urlPhoto,
        vendido: vendido
    }

    data[usuarioIdx].productos[productoIdx] = producto;

    res.json(producto);

});
    

//EDITAR USUARIO
app.put('/usuarios/:id/editar', mid.autenticarUsuario, mid.bodyEditUsuario, (req, res) => {
    const mail  = req.usuario.email;
    const { id } = req.params;
    const { nombre, apellido, fechaDeNac, urlPhoto, nroTelefono, localidad } = req.body;

    const idx = data.findIndex( usuario => usuario.email === mail && usuario.id === +id);

    data[idx].nombre = nombre;
    data[idx].apellido = apellido;
    data[idx].fechaDeNac = fechaDeNac;
    data[idx].urlPhoto = urlPhoto;
    data[idx].nroTelefono = nroTelefono;
    data[idx].localidad = localidad;


    res.json(`El usuario se editó exitósamente.`);
});


app.listen( 3000, () => {
    console.log('Servidor iniciado');
});

