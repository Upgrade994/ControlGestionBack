const mongoose = require("mongoose");
mongoose.set('useFindAndModify', false);

var _hour = new Date().toLocaleTimeString();
var _date = new Date().toLocaleDateString();

const Inputs = mongoose.model(
    "Inputs",
    new mongoose.Schema({
        anio: {
            type: Number
        },
        folio: {
            type: Number
        },
        num_oficio: {
            type: String,
            uppercase: true
        },
        fecha_oficio: {
            type: Date,
            default: _date
        },
        fecha_vencimiento: {
            type: Date,
            default: _date
        },
        fecha_recepcion: {
            type: Date,
            default: _date
        },
        hora_recepcion: {
            type: Date,
            default: _hour
        },
        acuse_recibido: {
            type: String,
            uppercase: true
        },
        instrumento_juridico: {
            type: String,
            uppercase: true
        },
        dirigido_a: {
            type: String,
            uppercase: true
        },
        institucion_origen: {
            type: String,
            uppercase: true
        },
        asunto: {
            type: String,
            uppercase: true
        },
        asignado: {
            type: String,
            uppercase: true
        },
        estatus: {
            type: String,
            uppercase: true
        },
        observacion: {
            type: String,
            uppercase: true
        },
        create_user: {
            id: String,
            username: String,
            email: String,
            accessToken: String,
        },
        editor_user: {
            id: String,
            username: String,
            email: String,
            accessToken: String,
        },
        edit_count: {
            type: Number
        }
    },
    {
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt'
        },
    })
);

module.exports = Inputs;