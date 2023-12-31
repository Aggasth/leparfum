const express = require('express');
const axios = require('axios');
require('dotenv').config();
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const nodemailer = require('nodemailer');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Subs = require('./models/Subs');
const Preferences = require('./models/Preferences');
const Sale = require('./models/Sale');
const { getActivityLabel, getSeasonLabel, getEventLabel, getColorLabel } = require('./public/Preferencias');
const Product = require('./models/Product.js');
const Types = require('./models/Types');
const Brand = require('./models/Brand');
const config = require('./config');
const path = require('path');
const flash = require('connect-flash');
const { name } = require('ejs');
const { MercadoPagoConfig, Payment } = require('mercadopago');
const { float } = require('webidl-conversions');
const bodyParser = require('body-parser');
const Recomendacion = require('./models/Recomendacion');
const { validationResult, body } = require('express-validator');



const app = express();
app.use(flash());
app.use(express.json());
// Define las rutas de archivo estaticos para utilizarlos
app.use(express.static('views'));
app.use('/public', express.static('public', { 'Content-Type': 'text/javascript' }));



// Conecta a la base de datos MongoDB
mongoose.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error(err));
  //const client = new MercadoPagoConfig({ accessToken: 'TEST-6035887927031399-111415-7066aae8d2ae1ccb227f669af8cc6497-318354987', options: { timeout: 5000 }});
  //const payment = new Payment(client);
  
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
app.get('/suscripcion', (req, res) => {
  res.render('suscripcion', { isLoggedIn: req.isAuthenticated() });
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

// Ruta para obtener todos los productos
app.get('/api/productos', async (req, res) => {
  try {
    // Obtén todos los productos según la consulta actual
    const productos = await Product.find(consultaOriginal);
    res.json({ productos });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/productos-filtrados', async (req, res) => {
  console.log(req.body); // Imprime los datos recibidos en la consola

  const marcasSeleccionadas = req.body.marcasSeleccionadas || [];
  const tiposSeleccionados = req.body.tiposSeleccionados || [];

  // Construye la consulta para filtrar productos
  const query = {};

  if (marcasSeleccionadas.length > 0) {
    query.marca = { $in: marcasSeleccionadas };
  }

  if (tiposSeleccionados.length > 0) {
    query.tipo = { $all: tiposSeleccionados }; // Utiliza $all para el operador "AND"
  }

  try {
    // Ejecuta la consulta en la base de datos
    const productos = await Product.find(query);
    console.log(productos); // Imprime los productos devueltos por la consulta
    res.json({ productos });
  } catch (error) {
    console.error('Error al obtener productos filtrados:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
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





app.post('/register', async (req, res) => {
  const { email, password, celular, name, sexo, direccion, actividad, estacion, evento, color } = req.body;
console.log("lo que viene del registro", req.body);
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
      direccion: direccion,
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

    
    function recomendarPerfume(sexo, actividad, estacion, evento, color) {
      let recomendacion = "";
    
      const esMasculino = sexo === 'masculino';
      const esFemenino = sexo === 'femenino';
    
      if ((esMasculino || esFemenino) && actividad === '1' && estacion === '1' && evento === '1' && color === '1') {
        recomendacion = esMasculino ? 'Perfumes citricos' : 'Perfumes Arabes';
      } else if ((esMasculino || esFemenino) && actividad === '2' && estacion === '2' && evento === '3' && color === '3') {
        recomendacion = esMasculino ? 'Perfumes Chipres Románticos' : 'Perfumes Chipres Románticos';
      } else if ((esMasculino || esFemenino) && actividad === '1' && estacion === '1' && evento === '2' && color === '2') {
        recomendacion = esMasculino ? 'Perfumes Amaderados' : 'Perfumes Amaderados';
      } else if ((esMasculino || esFemenino) && actividad === '3' && estacion === '2' && evento === '3' && color === '3') {
        recomendacion = esMasculino ? 'Perfumes Acaramelados' : 'Perfumes Acaramelados';
      } else if ((esMasculino || esFemenino) && actividad === '2' && estacion === '3' && evento === '1' && color === '3') {
        recomendacion = esMasculino ? 'Perfumes Florales' : 'Perfumes Florales';
      } else if ((esMasculino || esFemenino) && actividad === '1' && estacion === '3' && evento === '3' && color === '2') {
        recomendacion = esMasculino ? 'Perfumes Dulces' : 'Perfumes Dulces';
      } else if ((esMasculino || esFemenino) && actividad === '1' && estacion === '1' && evento === '1' && color === '1') {
        recomendacion = esMasculino ? 'Perfumes Arabes' : 'Perfumes citricos';
      } else {
        recomendacion = 'Perfumes Sport';
      }
    
      return recomendacion;
    }

const recomendacionUsuario = recomendarPerfume(sexo, actividad, estacion, evento, color);

// Crear una instancia de Recomendacion y guardarla en la base de datos
const nuevaRecomendacion = new Recomendacion({
    idUser: newUser._id, // Asignar el ID del usuario
    preferencia: recomendacionUsuario // Guardar la recomendación de perfume
});

await nuevaRecomendacion.save();
    res.redirect(`/login?isLoggedIn=${req.isAuthenticated()}&recomendacion=${recomendacionUsuario}`);


  } catch (error) {
    console.error(error);
    res.status(500).send('Error en el registro');
  }
});


/*function asignarIdTipoPerfume(sexo, actividad, estacion, evento, color) {
  // Imprime los valores para depuración
  console.log(`Sexo: ${sexo}, Actividad: ${actividad}, Estación: ${estacion}, Evento: ${evento}, Color: ${color}`);

  // Lógica para asignar el idTipoPerfume según las preferencias
  if (sexo === 'Masculino' && actividad === 1 && estacion === 1 && evento === 1 && color === 1) {
    console.log('Condición 1');
    return 1;
  } else if (sexo === 'Masculino' && actividad === 'Salir ocasionalmente a tomar algo' && color === 'Pasteles') {
    // Resto de condiciones
    // ...
  } else if (sexo === 'Femenino' && actividad === 'Juntas con amigos' && estacion === 'Primavera' && evento === 'Reuniones informales con amigos') {
    // Resto de condiciones
    // ...
  } else if (sexo === 'Masculino' && actividad === 'Juntas con amigos' && estacion === 'Invierno' && evento === 'Reuniones en ambientes cerrados') {
    // Resto de condiciones
    // ...
  } else {
    // Si no se cumple ninguna condición, establece un valor predeterminado
    console.log('Condición predeterminada');
    return 3; // O puedes aplicar alguna lógica adicional aquí
  }
}*/





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

    // Obtén la recomendación del usuario si está disponible
    const recomendacion = await Recomendacion.findOne({ idUser: user._id });

    // Obtén productos recomendados

    // Renderiza la vista de cuentas y pasa el usuario, sus preferencias, la recomendación y los productos recomendados
    res.render('account', {
      user,
      preferences,
      recomendacion,
      getActivityLabel,
      getSeasonLabel,
      getEventLabel,
      getColorLabel
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error interno del servidor');
  }
});


app.post('/update-profile', isAuthenticated,
  [
    // Agrega reglas de validación aquí según tus requisitos
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('contraseña').optional().notEmpty().withMessage('La contraseña actual es obligatoria'),
    body('newPass').optional().isLength({ min: 2 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres'),
    body('newPass2').optional().custom((value, { req }) => {
      if (value !== req.body.newPass) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    }),
  ],
  async (req, res) => {
    try {
      // Manejo de errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Obtén los datos del formulario del cuerpo de la solicitud
      const { nombre, contraseña, newPass, newPass2 } = req.body;

      // Actualiza la información del usuario en la base de datos
      const user = req.user; // Asumiendo que `req.user` contiene la información del usuario autenticado
      user.name = nombre;

      // Lógica para verificar y actualizar la contraseña si es necesario
      if (contraseña) {
        const passwordMatch = await bcrypt.compare(contraseña, user.password);

        if (!passwordMatch) {
          return res.status(401).send('Contraseña actual incorrecta');
        }

        // Hash de la nueva contraseña antes de guardarla en la base de datos
        const hashedNewPassword = await bcrypt.hash(newPass, 10);
        user.password = hashedNewPassword;
      }

      // Guarda los cambios en la base de datos
      await user.save();

      // Redirige a la página de cuenta o envía una respuesta de éxito
      res.redirect('/account');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error interno del servidor: ' + error.message);
    }
  }
);

// Ruta para actualizar la información de contacto
app.post('/update-contact', isAuthenticated, async (req, res) => {
  try {
      // Asegúrate de que req.user está definido
      if (!req.user) {
          return res.status(401).send('Usuario no autenticado');
      }

      // Lógica para actualizar la información de contacto
      const user = req.user;
      user.celular = req.body.celular;
      await user.save();

      // Redirige a la página de cuenta o envía una respuesta de éxito
      res.redirect('/account');
  } catch (error) {
      console.error(error);
      res.status(500).send('Error interno del servidor');
  }
});


// Ruta para actualizar la información de direcciones
app.post('/update-address', isAuthenticated, async (req, res) => {
  try {
      // Asegúrate de que req.user está definido
      if (!req.user) {
          return res.status(401).send('Usuario no autenticado');
      }

      // Lógica para actualizar la dirección
      const user = req.user;
      user.direccion = req.body.direccion;
      await user.save();

      // Redirige a la página de cuenta o envía una respuesta de éxito
      res.redirect('/account');
  } catch (error) {
      console.error(error);
      res.status(500).send('Error interno del servidor');
  }
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
      payer_email: 'TESTUSER611643007@testuser.com',
      items: [
        {
          title: 'Carrito de compra',
          description: 'Productos de LeParfum',
          picture_url: 'http://www.myapp.com/myimage.jpg',
          category_id: 'Perfumes',
          currency_id: 'CLP',
          quantity: 1,
          unit_price: total,
        },
      ],
      back_urls: {
        failure: 'http://localhost:3000/payment-error',
        pending: 'https://google.com',
        success: 'http://localhost:3000/payment-success',
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
    const userId = req.isAuthenticated() ? req.user._id : null; // ID del usuario autenticado
    const cart = req.session.cart; // Carrito de compras almacenado en la sesión
    const total = req.session.total; // Total de la compra
    await PaymentControllerInstance.saveSale(userId, cart, total)
    const initPoint = await PaymentControllerInstance.getPaymentLink(req, res);
    
    // Redirige al init_point obtenido
    console.log("link de pago:", initPoint);
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

app.post('/addToCart', async (req, res) => {
  const productId = req.body.productId;
  const quantity = req.body.cantidad;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).send('Producto no encontrado');
    }

    // Verifica si hay disponibilidad de stock
    if (!product.disponibilidad || product.cantidad < quantity || quantity <= 0) {
      return res.redirect(`/template-product/${productId}?message=Producto sin stock`);
    }

    // Reduce la cantidad en stock basado en la cantidad seleccionada por el usuario
    product.cantidad -= quantity;
    await product.save();

    // Lógica para agregar al carrito en la sesión
    if (!req.session.cart) {
      req.session.cart = [];
    }

    req.session.cart.push({ productId, quantity });
    const message = "Añadido al carro!";
    
    // Redirecciona a la página del producto con un mensaje
    res.redirect(`/template-product/${productId}?message=${message}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error interno del servidor');
  }
});

// Endpoint para eliminar un producto del carrito
app.delete('/eliminarProducto/:productId', (req, res) => {
  const productId = req.params.productId;

  // Encuentra el producto en el carrito y elimínalo de la sesión
  if (req.session.cart) {
      req.session.cart = req.session.cart.filter(item => item.productId !== productId);
      res.sendStatus(204); // Envía una respuesta exitosa
  } else {
      res.status(404).send('Carrito no encontrado');
  }
});



app.get('/success-suscripcion', (req, res) => {
  res.render('success-suscripcion', { isLoggedIn: req.isAuthenticated() });
});

app.get('/forget-password', (req, res) => {
  res.render('forget-password', { isLoggedIn: req.isAuthenticated() });
});
  
app.post('/enviarPass', async (req, res) => {
  try {
    const { email } = req.body; // Supongamos que recibes el email del cliente en la solicitud

    // Buscar al usuario por su correo electrónico
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send('Usuario no encontrado');
    }
    // Configurar nodemailer
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      service: 'Gmail',
      auth: {
        user: 'christopherhndez3@gmail.com', // Coloca aquí tu dirección de correo electrónico
        pass: ''
      }
    });

    const password = user.password; 
    // Crear el mensaje
    const mailOptions = {
      from: 'christopherhndez3@gmail.com', // Dirección de correo electrónico remitente
      to: user.email, // Dirección de correo electrónico del destinatario
      subject: 'Contraseña de tu cuenta',
      text: `Tu contraseña es: ${password}` // ${user.password} Suponiendo que la contraseña está almacenada en la propiedad 'password' del modelo de usuario
    };

    // Enviar el correo electrónico
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error al enviar el correo:', error);
        res.status(500).send('Error al enviar el correo');
      } else {
        console.log('Correo enviado:', info.response);
      }
    });
  } catch (error) {
    console.error('Error al enviar la contraseña por correo:', error);
    res.status(500).send('Error al enviar la contraseña por correo');
  }
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


app.post('/update-profile', isAuthenticated,
  [
    // Agrega reglas de validación aquí según tus requisitos
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('contraseña').optional().notEmpty().withMessage('La contraseña actual es obligatoria'),
    body('newPass').optional().isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres'),
    body('newPass2').optional().custom((value, { req }) => {
      if (value !== req.body.newPass) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    }),
  ],
  async (req, res) => {
    try {
      // Manejo de errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Obtén los datos del formulario del cuerpo de la solicitud
      const { nombre, contraseña, newPass, newPass2 } = req.body;

      // Actualiza la información del usuario en la base de datos
      const user = req.user; // Asumiendo que `req.user` contiene la información del usuario autenticado
      user.name = nombre;

      // Lógica para verificar y actualizar la contraseña si es necesario
      if (contraseña) {
        const passwordMatch = await bcrypt.compare(contraseña, user.password);

        if (!passwordMatch) {
          return res.status(401).send('Contraseña actual incorrecta');
        }

        // Hash de la nueva contraseña antes de guardarla en la base de datos
        const hashedNewPassword = await bcrypt.hash(newPass, 10);
        user.password = hashedNewPassword;
      }

      // Guarda los cambios en la base de datos
      await user.save();

      // Redirige a la página de cuenta o envía una respuesta de éxito
      res.redirect('/account');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error interno del servidor: ' + error.message);
    }
  }
);

// Ruta para actualizar la información de contacto
app.post('/update-contact', isAuthenticated, async (req, res) => {
  try {
      // Asegúrate de que req.user está definido
      if (!req.user) {
          return res.status(401).send('Usuario no autenticado');
      }

      // Lógica para actualizar la información de contacto
      const user = req.user;
      user.celular = req.body.celular;
      await user.save();

      // Redirige a la página de cuenta o envía una respuesta de éxito
      res.redirect('/account');
  } catch (error) {
      console.error(error);
      res.status(500).send('Error interno del servidor');
  }
});


// Ruta para actualizar la información de direcciones
app.post('/update-address', isAuthenticated, async (req, res) => {
  try {
      // Asegúrate de que req.user está definido
      if (!req.user) {
          return res.status(401).send('Usuario no autenticado');
      }

      // Lógica para actualizar la dirección
      const user = req.user;
      user.direccion = req.body.direccion;
      await user.save();

      // Redirige a la página de cuenta o envía una respuesta de éxito
      res.redirect('/account');
  } catch (error) {
      console.error(error);
      res.status(500).send('Error interno del servidor');
  }
});
// En tu app.js
// Supongamos que tienes un endpoint para actualizar la dirección de un usuario
app.post('/usuarios/:userId/direccion', async (req, res) => {
  const userId = req.isAuthenticated() ? req.user._id : null;
  const nuevaDireccion = req.body.direccion;

  try {
      const updatedUser = await User.findByIdAndUpdate(userId, { direccion: nuevaDireccion });

      console.log('Usuario actualizado:', updatedUser); // Verifica si el usuario se actualizó correctamente

      // Envía una respuesta exitosa
      res.render('account', { isLoggedIn: req.isAuthenticated() });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar la dirección' });
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
