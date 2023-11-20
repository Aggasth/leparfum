const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const config = require('./config');
const path = require('path');
const flash = require('connect-flash');
const bodyParser = require('body-parser');

// Modelos
const Admin = require('./models/Admin');
const Sales = require('./models/Sales');
const Product = require('./models/Product');
const Types = require('./models/Types');
const Brand = require('./models/Brand');
const User = require('./models/User');
const Subs = require('./models/Subs');
const { type } = require('os');

const app = express();
app.use(flash());

// Define las rutas de archivo estáticos para utilizarlos
app.use(express.static('views'));
app.use('/public', express.static('public', { 'Content-Type': 'text/javascript' }));
app.use('/modules', express.static('modules', { 'Content-Type': 'text/javascript' }));

// Conecta a la base de datos MongoDB
mongoose.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error(err));

  

//Midleware bodyparser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración de Express
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Configuración de Passport
passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
  Admin.findOne({ email: email })
    .then(admin => {
      if (!admin) return done(null, false, { message: 'Correo electrónico no registrado' });

      bcrypt.compare(password, admin.password, (err, isMatch) => {
        if (err) throw err;
        if (isMatch) return done(null, admin);
        else return done(null, false, { message: 'Contraseña incorrecta' });
      });
    })
    .catch(err => console.error(err));
}));

passport.serializeUser((admin, done) => {
  done(null, admin.id);
});

passport.deserializeUser((id, done) => {
  Admin.findById(id)
    .then(admin => {
      done(null, admin);
    })
    .catch(err => {
      done(err);
    });
});

// Seteo el uso de las vistas según la ruta
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Rutas -------------
app.get('/', (req, res) => {
  res.render('login', {isLoggedIn: req.isAuthenticated()});
});
app.get('/login', (req, res) => {
  res.render('login', {isLoggedIn: req.isAuthenticated()});
});

app.get('/login-error', (req, res) => {
  res.render('login-error', {isLoggedIn: req.isAuthenticated()});
});

app.get('/modules/config', isAuthenticated, (req, res) => {
  res.render('modules/config', {isLoggedIn: req.isAuthenticated()});
});

app.get('/admin', isAuthenticated, (req, res) => {
  res.render('admin', {isLoggedIn: req.isAuthenticated()});
});

app.get('/modules/product', isAuthenticated, (req, res) => {

  res.render('modules/product', {isLoggedIn: req.isAuthenticated()} );
});

app.get('/modules/user', isAuthenticated, (req, res) => {
  res.render('modules/user', {isLoggedIn: req.isAuthenticated()});
});

app.get('/modules/sales', isAuthenticated, (req, res) => {
  res.render('modules/sales', {isLoggedIn: req.isAuthenticated()});
});

app.get('/modules/suscripciones', isAuthenticated, (req, res) => {
  res.render('modules/suscripciones', {isLoggedIn: req.isAuthenticated()});
});

app.get('/register', (req, res) => {
  res.render('register', { isLoggedIn: req.isAuthenticated() });
});

app.get('/api/productos', isAuthenticated, async (req, res) => {
  try {
    const productos = await Product.find();
    res.json({ productos });
  } catch (error) {
    console.error('Error al cargar productos desde la base de datos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
app.get('/api/usuarios', isAuthenticated, async (req, res) => {
  try {
    const usuarios = await User.find();
    const suscripciones = await Subs.find();
    
    res.json({ usuarios, suscripciones });
  } catch (error) {
    console.error('Error al cargar usuarios y suscripciones desde la base de datos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/load-config', isAuthenticated, async (req, res) => {
  try {
    const marcas = await Brand.find();
    const tipos = await Types.find();
    
    res.json({ marcas, tipos });
  } catch (error) {
    console.error('Error al cargar marcas y tipos desde la base de datos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/add-type', isAuthenticated, async (req, res) => {
  try {
      const newType = req.body.nameTipo;

      if (!newType) {
          throw new Error('Error con el formato de ingreso del tipo');
      }

      const existingType = await Types.findOne({ tipo: newType });
      if (existingType) {
         return res.status(400).json({ error: 'El tipo ya existe', redirect: true, redirectUrl: '/modules/config' });
      }

      const addType = new Types({
        tipo: newType
      });
  
      await addType.save();
  
      const referer = req.get('referer');
      const redirectUrl = referer || '/';
      res.redirect(redirectUrl); // Redirige a la página original

  } catch (error) {
      console.error('Error al agregar el tipo:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/add-brand', isAuthenticated, async (req, res) => {
  const { nameBrand } = req.body;

  try {
    const existingBrand = await Brand.findOne({ nombre: nameBrand });
    if (existingBrand) {
      return res.status(400).json({ error: 'La marca ya existe', redirect: true, redirectUrl: '/modules/config' });
    }
    
    const addBrand = new Brand({
      nombre: nameBrand
    });

    await addBrand.save();

    const referer = req.get('referer');
    const redirectUrl = referer || '/';
    res.redirect(redirectUrl); // Redirige a la página original
  } catch (error) {
    console.error('Error al agregar la marca:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


app.post('/eliminar-tipo', isAuthenticated, async (req, res) => {
  const { selectedValue } = req.body;

  try {
    if (!selectedValue) {
      return res.status(400).json({ error: 'Valor no proporcionado para eliminar' });
    }
    
    const deletedType = await Types.findOneAndDelete({ tipo: selectedValue });

    if (!deletedType) {
      return res.status(404).json({ error: 'Tipo no encontrado' });
    }


    res.status(200).json({ message: 'Tipo eliminado exitosamente', redirect: true, redirectUrl: '/modules/config' });
  } catch (error) {
    console.error('Error al eliminar el tipo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/eliminar-marca', isAuthenticated, async (req, res) => {
  const { selectedValue } = req.body;

  try {
    if (!selectedValue) {
      return res.status(400).json({ error: 'Valor no proporcionado para eliminar' });
    }
    
    const deletedType = await Brand.findOneAndDelete({ nombre: selectedValue });

    if (!deletedType) {
      return res.status(404).json({ error: 'Marca no encontrada' });
    }
    res.status(200).json({ message: 'Marca eliminada exitosamente', redirect: true, redirectUrl: '/modules/config' });
  } catch (error) {
    console.error('Error al eliminar la marca:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});








app.get('/api/sales', isAuthenticated, async (req, res) => {
  try {
    // Obtener la lista de ventas
    const salesList = await Sales.find();

    // Obtener la lista de usuarios
    const userList = await User.find();

    // Obtener la lista de productos
    const productList = await Product.find();

    // Mapear ventas y agregar información adicional
    const mappedSales = salesList.map((sale) => {

      // Buscar el usuario asociado a la venta
      const user = userList.find((user) => user._id.toString() === sale.idUser);

      // Obtener el nombre del cliente
      const nombreCliente = user ? user.name : 'Usuario no encontrado';

      // Obtener los productos
      const productos = sale.cart.map((item) => {
        const product = productList.find((product) => product._id.toString() === item.productId);
        const productName = product ? product.nombreProducto : 'Producto no encontrado';
        return {
          _id: item.productId,
          nombre: productName,
          cantidad: item.quantity,
        };
      });

      // Obtener el total de la compra
      const totalCompra = sale.total;

      // Obtener la fecha
      const fecha = sale.date;

      // Crear un nuevo objeto con la información deseada
      return {
        nombreCliente,
        productos,
        totalCompra,
        fecha,
      };
    });

    // Enviar la lista generada como respuesta
    res.json({ sales: mappedSales });
  } catch (error) {
    console.error('Error al cargar usuarios y suscripciones desde la base de datos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});



// Cerrar sesión
app.get('/logout', isAuthenticated, (req, res) => {
  req.logout();
  res.redirect('/');
});

// Dashboard protegido
app.get('/admin', isAuthenticated, (req, res) => {
  res.send('admin', {isLoggedIn: req.isAuthenticated()});
});

// Middleware para verificar la autenticación
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

//Llamadas a la API
app.get('/api/tipos', async (req, res) => {
  Types.find();
  try {
    const tipos = await Types.distinct('tipo'); // 'tipo' es el atributo correcto en la colección Types
    res.json({ tipos });
  } catch (error) {
    console.error('Error al cargar tipos desde la base de datos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/marcas', async (req, res) => {
  Brand.find();
  try {
    const marcas = await Brand.distinct('nombre'); // 'nombre' es el atributo correcto en la colección Brand
    res.json({ marcas });
  } catch (error) {
    console.error('Error al cargar marcas desde la base de datos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/product-add', async (req, res) => {
  const { nameProduct, priceProduct, sexSelect, stockProduct, tagsProduct, brandProduct, descProduct, sizeProduct, imgProduct } = req.body;
  
  try {
    const stock = parseInt(stockProduct);

    const isAvailable = stock > 0;
    
    // Verifica si tagsProduct está definido y no es nulo antes de llamar a split
    const tipoArray = tagsProduct ? tagsProduct.split(',') : [];


    // Crear un nuevo producto
    const newProduct = new Product({
      nombreProducto: nameProduct,
      imagen: imgProduct,
      precio: parseInt(priceProduct),
      sexo: sexSelect,
      cantidad: parseInt(stockProduct),
      tipo: tipoArray,
      disponibilidad: isAvailable,
      tamaño: sizeProduct,
      marca: brandProduct,
      descripcion: descProduct
    })

    await newProduct.save();

    const referer = req.get('referer');
    const redirectUrl = referer || '/';
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Error al insertar el producto:', error);
    res.status(500).send('Error interno del servidor');
  }
});

app.get('/api/product-edit/:id', isAuthenticated, async (req, res) => {
  const productId = req.params.id;

  try {
     const producto = await Product.findById(productId);
     if (producto) {
        res.json({ producto });
     } else {
        res.status(404).json({ error: 'Producto no encontrado' });
     }
  } catch (error) {
     console.error('Error al obtener datos del producto para editar:', error);
     res.status(500).json({ error: 'Error interno del servidor' });
  }
});





// Ruta de registro
app.post('/register', async (req, res) => {
  const { email, password, celular, name, direccion } = req.body;

  try {
    // Verificar si el correo electrónico ya está registrado
    const existingAdmin = await Admin.findOne({ email: email });

    if (existingAdmin) {
      // El correo electrónico ya está registrado
      return res.render('register', { message: 'El correo electrónico ya está registrado', isLoggedIn: req.isAuthenticated() });
    }

    // Crear un nuevo administrador y cifrar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      email: email,
      password: hashedPassword,
      celular: celular,
      name: name,
      direccion: direccion
    });

    await newAdmin.save();

    res.redirect('/');  // Redirige después de un registro exitoso
  } catch (error) {
    console.error(error);
    res.status(500).send('Error interno del servidor');
  }
});

// Iniciar sesión
app.post('/login', passport.authenticate('local', {
  successRedirect: '/admin',
  failureRedirect: '/login-error',
  failureFlash: true
}), (req, res) => {
  console.log("usuario autenticado", req.user);
  console.log("usuario sesión", req.session);
  // Puedes redirigir o renderizar aquí si es necesario
  res.redirect('/');
});


const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Servidor en ejecución en el puerto ${PORT}`));
