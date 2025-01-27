const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dbConfig = require("./config/db.config");
const db = require("./models");
const initializeRoles = require("./utils/initializeRoles");
const initializeAreas = require("./utils/initializeAreas");

const app = express();

// Configuración de CORS simplificada
const corsOptions = {
    origin: "*", // O una lista de orígenes específicos para mayor seguridad
    methods: "GET, POST, OPTIONS, PUT, DELETE",
    allowedHeaders: "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json({ limit: '5mb' })); // No es necesario extended: true a menos que uses objetos anidados complejos
app.use(bodyParser.urlencoded({ limit: "5mb", extended: true, parameterLimit: 50000 }));
app.use(bodyParser.text({ limit: '20mb' }));

// Conexión a la base de datos con reintentos
async function connectToDatabase() {
    let retries = 5;
    while (retries > 0) {
        try {
            await db.mongoose.connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`);
            console.log("Successfully connected to MongoDB.");
            await initializeRoles();
            await initializeAreas();
            return;
        } catch (error) {
            console.error(`Connection error (retries left: ${retries}):`, error);
            retries--;
            await new Promise(resolve => setTimeout(resolve, 5000)); // Esperar 5 segundos antes de reintentar
        }
    }
    console.error("Failed to connect to MongoDB after multiple retries.");
    process.exit(1);
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

// Iniciar el servidor DESPUÉS de conectar a la base de datos
const PORT = process.env.PORT || 8082;
connectToDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}.`);
    });
});