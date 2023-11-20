const express = require('express');
const axios = require('axios');
require('dotenv').config();
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Subs = require('./models/Subs');
const Preferences = require('./models/Preferences');
const Sale = require('./models/Sale');
const { getActivityLabel, getSeasonLabel, getEventLabel, getColorLabel } = require('./public/Preferencias');
const Product = require('./models/Product');
const Types = require('./models/Types');
const Brand = require('./models/Brand');
const config = require('./config');
const path = require('path');
const flash = require('connect-flash');
const { name } = require('ejs');
const { MercadoPagoConfig, Payment } = require('mercadopago');
const { float } = require('webidl-conversions');
const bodyParser = require('body-parser');



const app = express();
app.use(flash());
// Define las rutas de archivo estaticos para utilizarlos
app.use(express.static('views'));
app.use('/public', express.static('public', { 'Content-Type': 'text/javascript' }));



// Conecta a la base de datos MongoDB
mongoose.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error(err));
  const client = new MercadoPagoConfig({ accessToken: 'TEST-6035887927031399-111415-7066aae8d2ae1ccb227f669af8cc6497-318354987', options: { timeout: 5000 }});
  const payment = new Payment(client);
  
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

        // Compara la contraseña encriptada con bcrypt
        bcrypt.compare(password, user.password, (err, result) => {
           if (err) throw err;

           if (result) {
              return done(null, user);
           } else {
              return done(null, false, { message: 'Contraseña incorrecta' });
           }
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
  const productId = req.params.productId;
  const message = req.query.message || '';

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
            res.render('template-product', { message, product, similarProducts, isLoggedIn: req.isAuthenticated() });
            console.log("idproducto", product);
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
  res.render('login', { isLoggedIn: req.session.isLoggedIn, isLoggedIn: req.isAuthenticated() });
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

app.get('/payment-success', (req, res) => {
  res.render('payment-success', { isLoggedIn: req.isAuthenticated() });
});
app.get('/payment-error', (req, res) => {
  res.render('payment-error', { isLoggedIn: req.isAuthenticated() });
});



app.get('/info-page', (req, res) => {
  res.render('info-page', { isLoggedIn: req.isAuthenticated() });
});


app.get('/', (req, res) => {
  if (!req.session.cart) {
    req.session.cart = [];
  }


  const errorMessage = req.flash('error')[0];
  console.log("res.locals:", res.locals);
  console.log("isLoggedIn en la ruta principal:", res.locals.isLoggedIn);
  
  // Verifica si el usuario está autenticado antes de acceder a req.session.passport.user
  const userId = req.isAuthenticated() ? req.user._id : null;

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

    // Guardar las preferencias en la base de datos
    await newPreferences.save();

    res.redirect('/login?isLoggedIn=' + req.isAuthenticated());

  } catch (error) {
    console.error(error);
    res.status(500).send('Error en el registro');
  }
});


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
app.get('/account', isAuthenticated, async (req, res) => {
  try {
    // Verificar si el usuario está autenticado
    if (!req.isAuthenticated()) {
      // Si el usuario no está autenticado, redirige a la página de inicio de sesión
      return res.redirect('/login');
    }

    const user = req.user;

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
  res.render('suscripcion', { isLoggedIn: req.isAuthenticated() });
});


//Carrito
app.get('/shopping-cart', isAuthenticated, (req, res) => {
  
  const userInfo = req.user ? req.user : null;
  console.log("informacion del usuario: ", userInfo);

  // Obtener productos del carrito desde la sesión
  const cartProducts = req.session.cart || [];

  console.log("Productos en el carrito", cartProducts);

  // Verifica si hay productos en el carrito
  if (cartProducts.length > 0) {
    // Mapea los productos del carrito a un array de promesas para buscar la información del producto
    const productPromises = cartProducts.map(cartProduct => {
      if(cartProduct.productId.length > 0) {
        return Product.findById(cartProduct.productId)
                .then(product => {
                  if (!product) {
                    // Manejar el caso en que el producto no se encuentra
                    return Promise.reject('Producto no encontrado');
                  } else {
                    return {
                      product,
                      quantity: cartProduct.quantity
                    };
                  }
                });
      }else{
        return Promise.reject('Carrito vacío.');
      }
      
    });

    // Ejecuta todas las promesas en paralelo
    Promise.all(productPromises)
      .then(productsInfo => {
        // Calcular el total
        const total = productsInfo.reduce((acc, productInfo) => {
          return acc + (productInfo.product.precio * productInfo.quantity);
        }, 0);

        console.log("Total de la compra:", total);
       // req.session.cart.push = ({ productId, quantity, total });;
       req.session.total = total;
        // Renderiza la vista y pasa la información del usuario, los productos en el carrito y el total
        res.render('shopping-cart', { user: userInfo, productsInfo, cartProducts, total, isLoggedIn: req.isAuthenticated() });
      })
      .catch(error => {
        // Manejar errores
        console.error(error);
        res.status(500).send('Error interno del servidor');
      });
  } else {
    // Renderiza la vista con un carrito vacío
    productsInfo = [];
    total = 0;
    res.render('shopping-cart', { user: userInfo, productsInfo, total, cartProducts, isLoggedIn: req.isAuthenticated() });
  }
});

class PaymentService {
  async createPayment(total) {
    const url = 'https://api.mercadopago.com/checkout/preferences';
    const body = {
      payer_email: 'TESTUSER471227152@testuser.com',
      items: [
        {
          title: 'Carrito de compra',
          description: 'Productos de LeParfum',
          picture_url: 'http://www.myapp.com/myimage.jpg',
          category_id: 'category123',
          currency_id: 'CLP',
          quantity: 1,
          unit_price: total,
        },
      ],
      back_urls: {
        failure: 'https://google.com',
        pending: 'https://google.com',
        success: 'https://www.youtube.com/shorts/CB-EaTPfNfw',
      },
    };

    const payment = await axios.post(url, body, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
      },
    });

    return payment.data;
  }

  async createSubscription() {
    const url = 'https://api.mercadopago.com/preapproval';

    const body = {
      reason: 'Suscripción de ejemplo',
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: subscriptionValue,
        currency_id: 'CLP',
      },
      back_url: 'https://google.com',
      payer_email: 'TESTUSER471227152@testuser.com',
    };

    const subscription = await axios.post(url, body, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ACCESS_TOKEN_SUB}`,
      },
    });

    return subscription.data;
  }
}
class PaymentController {
  constructor(subscriptionService) {
    this.subscriptionService = subscriptionService;
  }

  async getPaymentLink(req, res) {
    try {
      const total = req.session.total;
      const paymentLink = await this.subscriptionService.createPayment(total);
      return paymentLink.init_point; // Devuelve solo el init_point
    } catch (error) {
      console.log(error);
      throw new Error('Failed to create payment');
    }
  }
  saveSub = async (userId, Type) => {
    try {
      const newSub = new Subs({
        idUser: userId,
        Type: Type,
        date: new Date()
      });
      await newSub.save();
    }catch (error) {
      console.log(error);
      throw new Error('Failed to save Subs');
    }
  }
  saveSale = async(userId, cart, total) => {
    try {
      const newSale = new Sale({
        idUser: userId,
        cart: cart,
        total: total,
        date: new Date() // Fecha actual
      });
      await newSale.save();
    } catch (error) {
      console.log(error);
      throw new Error('Failed to save sale');
    }
  }

  async getSubscriptionLink(req, res) {
    try {
      const subscription = await this.subscriptionService.createSubscription();
      return subscription.init_point;
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: true, msg: 'Failed to create subscription' });
    }
  }
}

const PaymentServiceInstance = new PaymentService();
const PaymentControllerInstance = new PaymentController(PaymentServiceInstance);

app.get('/payment', async (req, res) => {
  try {
    // Obtiene el enlace de pago desde el controlador
    const initPoint = await PaymentControllerInstance.getPaymentLink(req, res);
    const userId = req.isAuthenticated() ? req.user._id : null; // ID del usuario autenticado
    const cart = req.session.cart; // Carrito de compras almacenado en la sesión
    const total = req.session.total; // Total de la compra
    await PaymentControllerInstance.saveSale(userId, cart, total)
    // Redirige al init_point obtenido
    res.redirect(initPoint);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al procesar el pago');
  }
});

app.get('/subscription', async (req, res) => {
  const subscriptionValue = req.body.value; // Obtener el valor de suscripción desde el formulario
  console.log("precio sub: es", subscriptionValue);
  const subscriptionData = {
    reason: 'Suscripción de ejemplo',
    auto_recurring: {
      frequency: 1,
      frequency_type: 'months',
      transaction_amount: subscriptionValue, // Usar el valor de suscripción obtenido del formulario
      currency_id: 'CLP',
    },
    back_url: 'https://google.com.ar',
    payer_email: 'test_user_46945293@testuser.com',
    // Otros campos necesarios para crear la suscripción
  }
});



app.post('/subscription', async (req, res) => {
  const subscriptionType = req.body.subscriptionType;
  const subscriptionValue = req.body.amount;
  try {
    // Llamar a la función getSubscriptionLink y pasar subscriptionData
    const subscriptionLink = await PaymentControllerInstance.getSubscriptionLink(subscriptionData);
    res.redirect(subscriptionLink);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al procesar la suscripción');
  }
});


app.get('/subs', async (req, res) => {
  try {
    const userId = req.isAuthenticated() ? req.user._id : null;
    const Type = req.query.subscriptionType;
    console.log("tipo", Type);
    await PaymentControllerInstance.saveSub(userId, Type)
    res.redirect('https://www.mercadopago.cl/subscriptions/checkout?preapproval_plan_id=2c9380848bbab234018be480aa331c3d');

  } catch (error) {
    console.error(error);
    res.status(500).send('Error al procesar la suscripción');
  }
});


app.get('/subss', async (req, res) => {
  try {
    const userId = req.isAuthenticated() ? req.user._id : null;
    const Type = req.query.subscriptionType;
    console.log("tipo", Type);
    await PaymentControllerInstance.saveSub(userId, Type)
    res.redirect('https://www.mercadopago.cl/subscriptions/checkout?preapproval_plan_id=2c9380848bbab262018be4cfccb81d62');

  } catch (error) {
    console.error(error);
    res.status(500).send('Error al procesar la suscripción');
  }
});


app.get('/subsss', async (req, res) => {
  try {
    const userId = req.isAuthenticated() ? req.user._id : null;
    const Type = req.query.subscriptionType;
    console.log("tipo", Type);
    await PaymentControllerInstance.saveSub(userId, Type)
    res.redirect('https://www.mercadopago.cl/subscriptions/checkout?preapproval_plan_id=2c9380848bbab234018be4d1802e1c85');

  } catch (error) {
    console.error(error);
    res.status(500).send('Error al procesar la suscripción');
  }
});







app.post('/subscription', async (req, res) => {
  const subscriptionType = req.body.subscriptionType;
  const subscriptionValue = req.body.amount;
  try {
    const subscriptionLink = await PaymentControllerInstance.createSubscription(subscriptionType, subscriptionValue);
    res.redirect(subscriptionLink);
  } catch (error) {
    console.error('Error al procesar la suscripción:', error);
    res.status(500).send('Error al procesar la suscripción');
  }
});

app.post('/addToCart', (req, res) => {
  const productId = req.body.productId;
  const quantity = req.body.cantidad;

  if (!req.session.cart) {
    req.session.cart = [];
  }

  req.session.cart.push({ productId, quantity });
  const message = "Añadido al carro!"

  // Utiliza comillas invertidas para la cadena y la interpolación de variables
  res.redirect(`/template-product/${productId}?message=${message}`);
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

app.get('/api/sales', isAuthenticated, async (req, res) => {
  const userId = req.isAuthenticated() ? req.user._id : null;
  try {
    // Obtener la lista de ventas asociadas al _id del usuario logueado
    const salesList = await Sale.find({ idUser: userId });

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

// Ruta para la carga de la venta para success payment page
app.get('/api/payment-info', async (req, res) =>{
});

// Middleware para verificar la autenticación
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    res.locals.isLoggedIn = true;
  } else {
    res.locals.isLoggedIn = false;
  }
  return next();
};



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en ejecución en el puerto ${PORT}`));
