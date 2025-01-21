const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dbConfig = require("./config/db.config");

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});

// parse requests of content-type - application/json
app.use(bodyParser.json({limit: '50mb', extended: true}));

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
app.use(bodyParser.text({ limit: '200mb' }));

const db = require("./models");
const Role = db.role;

// db.mongoose
//   .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`)
//   .then(() => {
//     console.log("Successfully connect to MongoDB.");
//     initial();
//   })
//   .catch(err => {
//     console.log(dbConfig);
//     console.error("Connection error", err);
//     process.exit();
//   });

// Conexión a la base de datos con async/await y manejo de errores
async function connectToDatabase() {
  try {
      await db.mongoose.connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`);
      console.log("Successfully connected to MongoDB.");
      await initial(); // Inicializar roles después de la conexión exitosa
  } catch (error) {
      console.error("Connection error:", error);
      process.exit(1); // Salir con código de error
  }
}

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Bienvenido al Sistema de Control de Gestion" });
});

// routes
require("./routes/auth.routes")(app);
require("./routes/user.routes")(app);
require("./routes/input.routes")(app);
require("./routes/rol.routes")(app);
require("./routes/area.routes")(app);
require("./routes/institution.routes")(app);
require("./routes/instrument.routes")(app);

// set port, listen for requests
// const PORT = process.env.PORT || 8082;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}.`);
// });

// Iniciar el servidor DESPUÉS de conectar a la base de datos
const PORT = process.env.PORT || 8082;
connectToDatabase().then(() => { // Espera a que la conexión se establezca
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}.`);
    });
});

// function initial() {
//   Role.estimatedDocumentCount((err, count) => {
//     if (!err && count === 0) {
//       new Role({
//         name: "user"
//       }).save(err => {
//         if (err) {
//           console.log("error", err);
//         }
//         console.log("added 'user' to roles collection");
//       });

//       new Role({
//         name: "linker"
//       }).save(err => {
//         if (err) {
//           console.log("error", err);
//         }
//         console.log("added 'linker' to roles collection");
//       });

//       new Role({
//         name: "moderator"
//       }).save(err => {
//         if (err) {
//           console.log("error", err);
//         }
//         console.log("added 'moderator' to roles collection");
//       });

//       new Role({
//         name: "admin"
//       }).save(err => {
//         if (err) {
//           console.log("error", err);
//         }
//         console.log("added 'admin' to roles collection");
//       });
//     }
//   });
// }

async function initial() {
  try {
      const count = await Role.estimatedDocumentCount(); // Usando await
      if (count === 0) {
          await Role.create([ // Usando await también para Role.create()
              { name: "user" },
              { name: "linker" },
              { name: "moderator" },
              { name: "admin" }
          ]);
          console.log("Added roles to collection");
      }
  } catch (error) {
      console.error("Error initializing roles:", error);
  }
}