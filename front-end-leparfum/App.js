const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('./models/User');
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
app.use(flash());

app.use((req, res, next) => {
  res.locals.isLoggedIn = req.isAuthenticated();
  next();
});

// Configuración de Passport
passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
  User.findOne({ email: email })
    .then(user => {
      if (!user) return done(null, false, { message: 'Correo electrónico no registrado' });

      // Comparar la contraseña sin encriptar
      if (password === user.password) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Contraseña incorrecta' });
      }
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
            res.render('template-product', { product, similarProducts, isLoggedIn: req.isAuthenticated() });
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
  req.session.isLoggedIn = true;
  res.render('login', { isLoggedIn: req.session.isLoggedIn });
  console.log("usuario autenticado", req.isAuthenticated());
  console.log("usuario sesion", req.isAuthenticated());
});

app.get('/register', (req, res) => {
  res.render('register', { isLoggedIn: req.isAuthenticated() });
});

app.get('/login-error', (req, res) => {
  res.render('login-error', { isLoggedIn: req.isAuthenticated() });
});

app.get('/perfumeria', (req, res) => {
  Product.find()
    .then(productos => {
      res.render('perfumeria', { productos, isLoggedIn: req.isAuthenticated() });
    })
  .catch(err => {
      console.error(err);
      res.status(500).send('Error interno del servidor');
  });
});



app.get('/info-page', (req, res) => {
  res.render('info-page', { isLoggedIn: req.isAuthenticated() });
});


app.get('/', (req, res) => {
  const errorMessage = req.flash('error')[0];
  console.log("res.locals:", res.locals);
  console.log("isLoggedIn en la ruta principal:", res.locals.isLoggedIn);
  
  // Verifica si el usuario está autenticado antes de acceder a req.session.passport.user
  const userId = req.isAuthenticated() ? req.session.passport.user : null;

  console.log("info sesion", userId);

  // Cargar 4 productos en la variable "oferta"
  Product.find().limit(4)
    .then(oferta => {
      // Luego, carga 10 productos en la variable "listado"
      Product.find().limit(10)
        .then(listado => {
          res.render('landing', { oferta, listado, errorMessage, isLoggedIn: req.isAuthenticated(), userId });

          // Pasa el mensaje de error a la vista
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





// Registrarse
app.post('/register', (req, res) => {
  const { email, password, celular, name } = req.body;

  // Verificar si el correo electrónico ya está registrado
  User.findOne({ email: email })
    .then(user => {
      if (user) {
        // El correo electrónico ya está registrado
        res.render('register', { message: 'El correo electrónico ya está registrado', isLoggedIn: req.isAuthenticated() });
      } else {
        // Crear un nuevo usuario sin encriptar la contraseña
        const newUser = new User({
          email: email,
          password: password,
          celular: celular,
          name: name
        });

        newUser.save()
          .then(() => {
            res.redirect('/login', { isLoggedIn: req.isAuthenticated() });
          })
          .catch(err => console.error(err));
      }
    })
    .catch(err => console.error(err));
});


// Cerrar sesión
// Cerrar sesión
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect('/');
  });
});


// Dashboard protegido
app.get('/account', isAuthenticated, (req, res) => {
  res.render('account', { isLoggedIn: req.isAuthenticated() });
});

app.get('/suscripcion', (req, res) => {
  res.render('suscripcion', { isLoggedIn: req.isAuthenticated() });
});

//Carrito
app.get('/shopping-cart', (req, res) => {
  res.render('shopping-cart', { isLoggedIn: req.isAuthenticated() });
});

app.get('/success-suscripcion', (req, res) => {
  res.render('success-suscripcion', { isLoggedIn: req.isAuthenticated() });
});
  
// Iniciar sesión
app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login-error',
  failureFlash: true
}), (req, res) => {
  console.log("usuario autenticado", req.user);
  console.log("usuario sesion", req.session);
  res.redirect('/'); // Redirige después de imprimir para verificar si la sesión persiste en otras rutas
});


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
    res.locals.isLoggedIn = true;
  } else {
    res.locals.isLoggedIn = false;
  }
  return next();
}



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en ejecución en el puerto ${PORT}`));
