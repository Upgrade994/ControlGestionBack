const mongoose = require('mongoose');
const { Schema } = mongoose;

const seguimientoSchema = new Schema({
    oficio_salida: { type: String },
    fecha_respuesta: { type: Date, default: Date.now },
    usuario: {
        id: String,
        username: String,
    },
    comentarios: { type: String, uppercase: true }, // Observaciones
    archivosPdf_seguimiento: [{ type: String }],
    num_expediente: {type: String, uppercase: true},
    fecha_oficio_salida: {type: Date},
    fecha_acuse_recibido: {type: Date},
    destinatario: {type: String, uppercase: true},
    cargo: {type: String, uppercase: true},
    atencion_otorgada: {type: String, uppercase: true},
    anexo: {type: String},
    estatus: {type: String, uppercase: true},
    firma_visado: {type: String},
}, { timestamps: true });

const inputSchema = new Schema({
    anio: { type: Number, required: true, index: true },
    folio: { type: Number, required: true },
    num_oficio: { type: String, uppercase: true }, // Añade unique para evitar duplicados ----- , required: true, unique: true
    fecha_oficio: { type: Date, required: true }, // Usa tipo Date
    fecha_vencimiento: { type: Date }, // Usa tipo Date
    fecha_recepcion: { type: Date, required: true }, // Usa tipo Date
    hora_recepcion: { type: String }, // Considera usar un tipo Time si MongoDB lo soporta en tu versión.
    instrumento_juridico: { type: String, uppercase: true },
    remitente: { type: String, uppercase: true },
    institucion_origen: { type: String, uppercase: true },
    asunto: { type: String, uppercase: true },
    asignado: { type: String, uppercase: true },
    estatus: { type: String, uppercase: true },
    observacion: { type: String, uppercase: true },
    archivosPdf: [{ type: String }],
    create_user: { 
        id: String,
        username: String,
    },
    editor_user: { 
        id: String,
        username: String,
    },
    edit_count: { type: Number, default: 0 },
    deleted: { type: Boolean, default: false, index: true },
    seguimientos: { type: seguimientoSchema },
}, { timestamps: true });

// Índices compuestos (mejorados)
inputSchema.index({ anio: -1, createdAt: -1 });
inputSchema.index({ deleted: 1, anio: -1, createdAt: -1 });
inputSchema.index({ num_oficio: 1 });
inputSchema.index({ num_oficio: 1, deleted: 1 });

module.exports = mongoose.model('InputsNuevo', inputSchema);