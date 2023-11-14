const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Preferences = require('./models/Preferences');
const { getActivityLabel, getSeasonLabel, getEventLabel, getColorLabel } = require('./public/Preferencias');
const Product = require('./models/Product');
const Types = require('./models/Types');
const Brand = require('./models/Brand');
const config = require('./config');
const path = require('path');
const flash = require('connect-flash');
const { name } = require('ejs');

const app = express();
app.use(flash());
// Define las rutas de archivo estaticos para utilizarlos
app.use(express.static('views'));
app.use('/public', express.static('public', { 'Content-Type': 'text/javascript' }));



// Conecta a la base de datos MongoDB
mongoose.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error(err));

// Configuración de Express
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Configuración de Passport
passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
  User.findOne({ email: email })
    .then(user => {
      if (!user) return done(null, false, { message: 'Correo electrónico no registrado' });

      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) throw err;
        if (isMatch) return done(null, user);
        else return done(null, false, { message: 'Contraseña incorrecta' });
      });
    })
    .catch(err => console.error(err));
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => {
      done(null, user);
    })
    .catch(err => {
      done(err);
    });
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Rutas
app.get('/template-product/:productId', (req, res) => {
  const productId = req.params.productId; // Captura el ID del producto desde la URL

  Product.findById(productId)
    .then(product => {
      if (!product) {
        // Manejar el caso en que el producto no se encuentra
        res.status(404).send('Producto no encontrado');
      } else {
    
        const tagsArray = Array.isArray(product.tags) ? product.tags : [product.tags];

        // Encuentra productos similares por etiquetas
        Product.find({ tags: { $in: tagsArray }, _id: { $ne: productId } }) // Encuentra productos con etiquetas similares, excluyendo el producto actual
          .then(similarProducts => {
            // Renderiza la vista "template-product" y pasa los detalles del producto y productos similares
            res.render('template-product', { product, similarProducts, isLoggedIn: req.session.isLoggedIn });
          })
          .catch(err => {
            console.error(err);
            res.status(500).send('Error al buscar productos similares');
          });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error interno del servidor');
    });
});


app.get('/login', (req, res) => {
  res.render('login', { isLoggedIn: req.session.isLoggedIn });
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/login-error', (req, res) => {
  res.render('login-error', { isLoggedIn: req.session.isLoggedIn });
});

app.get('/perfumeria', (req, res) => {
  Product.find()
    .then(productos => {
      res.render('perfumeria', { productos, isLoggedIn: req.session.isLoggedIn });
    })
  .catch(err => {
      console.error(err);
      res.status(500).send('Error interno del servidor');
  });
});



app.get('/info-page', (req, res) => {
  res.render('info-page', { isLoggedIn: req.session.isLoggedIn });
});


app.get('/', (req, res) => {
  const errorMessage = req.flash('error')[0]; // Recupera el mensaje de error flash
  // Cargar 4 productos en la variable "oferta"
  Product.find().limit(4)
    .then(oferta => {
      // Luego, carga 10 productos en la variable "listado"
      Product.find().limit(10)
        .then(listado => {
          res.render('landing', { oferta, listado, errorMessage, isLoggedIn: req.session.isLoggedIn }); // Pasa el mensaje de error a la vista
        })
        .catch(err => {
          console.error(err);
          res.status(500).send('Error interno del servidor');
        });
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error interno del servidor');
    });
});
app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn || false;
  next();
});



// Registrarse
app.post('/register', async (req, res) => {
  const { email, password, celular, name, sexo, actividad, estacion, evento, color } = req.body;

  // Verificar si el correo electrónico ya está registrado
  try {
    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      // El correo electrónico ya está registrado
      return res.render('register', { message: 'El correo electrónico ya está registrado' });
    }

    // Crear un nuevo usuario
    const newUser = new User({
      email: email,
      password: await bcrypt.hash(password, 10),
      celular: celular,
      name: name
    });

    // Guardar el usuario para obtener su ID
    await newUser.save();

    // Crear un nuevo documento Preferences
    const newPreferences = new Preferences({
      usuario: newUser._id, // Asociar las preferencias con el usuario recién creado
      sexo: sexo,
      actividad: actividad,
      estacion: estacion,
      evento: evento,
      color: color
    });

    // Guardar las preferencias
    await newPreferences.save();

    // Asociar las preferencias con el usuario
    newUser.preferences = newPreferences._id;
    await newUser.save();

    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error interno del servidor');
  }
});


// Cerrar sesión
app.get('/logout', (req, res) => {
req.logout();
res.redirect('/');
});

// Dashboard protegido
app.get('/account', async (req, res) => {
  try {
    // Verificar si el usuario está autenticado
    if (!req.isAuthenticated()) {
      // Si el usuario no está autenticado, redirige a la página de inicio de sesión
      return res.redirect('/login');
    }

    // Obtén el usuario actual desde la sesión
    const user = req.user;

    // Verificar si el usuario tiene un ID antes de intentar acceder a sus preferencias
    if (!user || !user._id) {
      throw new Error('Usuario no válido');
    }

    // Obtén las preferencias del usuario si están disponibles
    const preferences = await Preferences.findOne({ usuario: user._id });

    // Renderiza la vista de cuentas y pasa el usuario y sus preferencias
    res.render('account', { user, preferences, getActivityLabel, getSeasonLabel, getEventLabel, getColorLabel });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error interno del servidor');
  }
});

app.get('/suscripcion', (req, res) => {
  res.render('suscripcion');
});
app.get('/shopping-cart', (req, res) => {
  res.render('shopping-cart');
});
app.get('/success-suscripcion', (req, res) => {
  res.render('success-suscripcion');
});
  
// Iniciar sesión
app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login-error',
  failureFlash: true
}));


// Ruta para cargar tipos
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

// Ruta para cargar marcas
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

// Middleware para verificar la autenticación
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
  }


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en ejecución en el puerto ${PORT}`));
