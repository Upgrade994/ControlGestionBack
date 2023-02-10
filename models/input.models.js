const mongoose = require("mongoose");
mongoose.set('useFindAndModify', false);

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
            type: String
        },
        fecha_vencimiento: {
            type: String
        },
        fecha_recepcion: {
            type: String
        },
        hora_recepcion: {
            type: String
        },
        instrumento_juridico: {
            type: String,
            uppercase: true
        },
        remitente: {
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
        },
        deleted: {
            type: Boolean
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