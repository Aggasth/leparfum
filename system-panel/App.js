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
const Product = require('./models/Product');
const Types = require('./models/Types');
const Brand = require('./models/Brand');
const User = require('./models/User');

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
    res.json({ usuarios });
  } catch (error) {
    console.error('Error al cargar usuarios desde la base de datos:', error);
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
  console.log(req.body);
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
