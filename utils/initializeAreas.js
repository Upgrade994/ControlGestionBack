const db = require("../models");
const Area = db.area;

async function initializeAreas() {
    try {
        const count = await Area.estimatedDocumentCount();
        if (count === 0) {
            await Area.create([
                { area: "CONSEJERO JURÍDICO" },
                { area: "SECRETARIA PARTICULAR Y DE COMUNICACIÓN SOCIAL" },
                { area: "DIRECCIÓN DE COORDINACIÓN Y CONTROL DE GESTIÓN" },
                { area: "DIRECCIÓN GENERAL DE LO CONTENCIOSO" },
                { area: "DIRECCIÓN DE ASISTENCIA TÉCNICA Y COMBATE A LA CORRUPCIÓN" },
                { area: "DIRECCIÓN DE SERVICIOS LEGALES" },
                { area: "DIRECCIÓN GENERAL CONSULTIVA" },
                { area: "DIRECCIÓN DE ESTUDIOS LEGISLATIVOS" },
                { area: "DIRECCIÓN DE ESTUDIOS JURÍDICOS" },
                { area: "DIRECCIÓN DE COMPILACIÓN NORMATIVA, ARCHIVO E IGUALDAD DE GÉNERO" },
                { area: "DIRECCIÓN ADMINISTRATIVA" },
                { area: "UNIDAD DE TRANSPARENCIA" },
                { area: "ASUNTO LIMITROFE" },
            ]);
            console.log("Added areas to collection");
        }
    } catch (error) {
        console.error("Error initializing areas:", error);
    }
}

module.exports = initializeAreas;