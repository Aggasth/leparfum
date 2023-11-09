const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const config = require('./config');
const router = express.Router();
const path = require('path');
const flash = require('connect-flash');
//Modelos
const Product = require('./models/Product');
const { appendFile } = require('fs/promises');

const app = express();
app.use(flash());

// Define las rutas de archivo estaticos para utilizarlos
app.use(express.static('views'));
app.use('/public', express.static('public', { 'Content-Type': 'text/javascript' }));
app.use('/modules', express.static('modules', { 'Content-Type': 'text/javascript' }));


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

//Seteo el uso de las vistas segun path
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Rutas -------------
app.get('/', (req, res) => {
  res.render('login');
});
app.get('/admin', (req, res) => {
  res.render('admin');
});
app.get('/modules/product', (req, res) => {
  res.render('modules/product');
});
app.get('/modules/user', (req, res) => {
  res.render('modules/user');
});

app.get('/modules/sales', (req, res) => {
  res.render('modules/sales');
});
app.get('/modules/inventory', (req, res) => {
  res.render('modules/inventory');
});
app.get('/modules/history', (req, res) => {
  res.render('modules/history');
});



app.get('/api/productos', async (req, res) => {
  try {
    const productos = await Product.find();
    res.json({ productos });
  } catch (error) {
    console.error('Error al cargar productos desde la base de datos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});



app.get('/login', (req, res) => {
  res.render('login');
});

// Cerrar sesión
app.get('/logout', (req, res) => {
req.logout();
res.redirect('/');
});

// Dashboard protegido
app.get('/admin', isAuthenticated, (req, res) => {
  res.send('admin');
});

// Middleware para verificar la autenticación
function isAuthenticated(req, res, next) {
if (req.isAuthenticated()) {
  return next();
}
res.redirect('/');
}

  
// Iniciar sesión
app.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/admin',
    failureRedirect: '/',
    failureFlash: true
  })(req, res, next);
});




const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Servidor en ejecución en el puerto ${PORT}`));
