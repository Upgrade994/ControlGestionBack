const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const MiModeloAntiguo = require('./models/input.models');
const MiModeloNuevo = require('./models/inputs.models');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util'); // Para fs.promises

// Promisify funciones de fs para usar async/await
const fsPromises = {
    mkdir: promisify(fs.mkdir),
    writeFile: promisify(fs.writeFile),
    appendFile: promisify(fs.appendFile)
};

const uri = 'mongodb://127.0.0.1:27017/ControlGestion';
const pdfFolderPath = path.join(__dirname, 'pdfs');
const logFile = 'migracion.log';
const BATCH_SIZE = 100;
const CAMPECHE_TIMEZONE_OFFSET = 18;

// Crea la carpeta de PDFs y limpia el archivo de log (usando async/await)
async function inicializar() {
    try {
        await fsPromises.mkdir(pdfFolderPath, { recursive: true });
        await fsPromises.writeFile(logFile, '');
        console.log("Archivos inicializados correctamente");
    } catch (error) {
        console.error("Error al inicializar archivos:", error);
        process.exit(1); // Sale del proceso si falla la inicialización
    }
}

async function log(message) {
    const timestamp = new Date().toISOString();
    try {
        await fsPromises.appendFile(logFile, `${timestamp}: ${message}\n`);
        console.log(message);
    } catch (error) {
        console.error("Error al escribir en el log:", error);
    }
}

async function guardarPDF(base64String, registroAntiguo, esSeguimiento = false) {
    if (!base64String) return null;

    try {
        const buffer = Buffer.from(base64String, 'base64');

        // Obtiene los datos para la ruta
        const asignado = registroAntiguo.asignado || 'SinAsignar';
        const fechaRecepcion = registroAntiguo.fecha_recepcion ? new Date(registroAntiguo.fecha_recepcion) : null;
        if (!fechaRecepcion) {
            await log(`Error: fecha_recepcion inválida para _id: ${registroAntiguo._id}`);
            return null;
        }
        const anio = fechaRecepcion.getFullYear();
        const mes = String(fechaRecepcion.getMonth() + 1).padStart(2, '0');
        const dia = fechaRecepcion.getDate() + 1;
        const folio = registroAntiguo.folio || 'SinFolio';

        // Construye la ruta base
        let rutaBase = path.join('C:', 'Control_Gestion_pdfs', asignado, String(anio), String(mes));

        // Añade la carpeta "Seguimiento" si es un PDF de seguimiento
        if (esSeguimiento) {
            rutaBase = path.join(rutaBase, 'Seguimiento');
        }

        // Crea las carpetas recursivamente
        await fsPromises.mkdir(rutaBase, { recursive: true });

        // Genera nombres de archivo únicos
        let contador = 1;
        let rutaCompleta;

        do {
            const nombreArchivo = `${dia}_${folio}_${String(contador).padStart(3, '0')}.pdf`;
            rutaCompleta = path.join(rutaBase, nombreArchivo);

            // Verifica si el archivo ya existe
            try {
                await fsPromises.access(rutaCompleta);
                contador++;
            } catch (error) {
                // El archivo no existe, podemos usar esta ruta
                break;
            }
        } while (true);

        await fsPromises.writeFile(rutaCompleta, buffer);

        return rutaCompleta;
    } catch (error) {
        await log(`Error al guardar PDF para _id: ${registroAntiguo._id}: ${error}`);
        return null;
    }
}

function convertirFecha(fechaStr) {
    if (!fechaStr) return null;

    const fechaUTC = new Date(fechaStr);
    const fechaCampeche = new Date(fechaUTC.getTime() + CAMPECHE_TIMEZONE_OFFSET * 60 * 60 * 1000);

    return fechaCampeche;
}

async function migrarDatos() {
    try {
        await inicializar(); // Inicializa archivos

        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        await log('Conexión a MongoDB exitosa.');

        let offset = 0;
        let registrosMigrados = 0;
        let registrosConError = 0;

        while (true) {
            const registrosAntiguos = await MiModeloAntiguo.find().skip(offset).limit(BATCH_SIZE).lean();

            if (registrosAntiguos.length === 0) break;

            // Procesamiento concurrente de PDFs
            const promesasPDF = registrosAntiguos.map(async (registroAntiguo) => {
                try {
                    const archivoPdf = registroAntiguo.pdfString ? await guardarPDF(registroAntiguo.pdfString, registroAntiguo) : null;
                    const archivoSegPdf = registroAntiguo.seg_pdfString ? await guardarPDF(registroAntiguo.seg_pdfString, registroAntiguo, true) : null;

                    return { registroAntiguo, archivoPdf, archivoSegPdf };
                } catch (error) {
                    await log(`Error procesando PDF para _id: ${registroAntiguo._id}: ${error}`);
                    return null; // Importante para que Promise.all no falle
                }
            });

            const resultadosPDF = await Promise.all(promesasPDF);
            const registrosConPDFs = resultadosPDF.filter(Boolean); // Filtra resultados nulos (errores)

            // Transformación y operaciones bulkWrite concurrentes
            const promesasBulkWrite = registrosConPDFs.map(async ({ registroAntiguo, archivoPdf, archivoSegPdf }) => {
                try {
                    const fechaRecepcion = convertirFecha(registroAntiguo.fecha_recepcion);
                    let estatus = registroAntiguo.estatus;

                    // Actualiza el estatus según las reglas
                    if (estatus === "PARA CONOCIMIENTO" || estatus === "CONCLUIDO") {
                        estatus = "ATENDIDO";
                    } else if (estatus === "EN TRAMITE") {
                        estatus = "NO ATENDIDO";
                    } else {
                        // Si no es ninguno de los valores anteriores, se establece como "NO ATENDIDO"
                        estatus = "NO ATENDIDO";
                        await log(`Advertencia: Estatus desconocido '${registroAntiguo.estatus}' para _id: ${registroAntiguo._id}. Se ha establecido como 'NO ATENDIDO'.`);
                    }

                    const nuevoRegistro = {
                        _id: registroAntiguo._id,
                        anio: fechaRecepcion ? fechaRecepcion.getFullYear() : null,
                        folio: registroAntiguo.folio,
                        num_oficio: registroAntiguo.num_oficio,
                        fecha_recepcion: convertirFecha(registroAntiguo.fecha_recepcion),
                        fecha_oficio: convertirFecha(registroAntiguo.fecha_oficio),
                        fecha_vencimiento: convertirFecha(registroAntiguo.fecha_vencimiento),
                        hora_recepcion: registroAntiguo.hora_recepcion,
                        instrumento_juridico: registroAntiguo.instrumento_juridico,
                        remitente: registroAntiguo.remitente,
                        institucion_origen: registroAntiguo.institucion_origen,
                        asunto: registroAntiguo.asunto,
                        asignado: registroAntiguo.asignado,
                        estatus: estatus,
                        observacion: registroAntiguo.observacion,
                        archivosPdf: archivoPdf ? [archivoPdf] : [], // Guarda la ruta
                        create_user: transformarUsuario(registroAntiguo.create_user),
                        editor_user: transformarUsuario(registroAntiguo.editor_user),
                        edit_count: registroAntiguo.edit_count || 0,
                        deleted: registroAntiguo.deleted || false,
                        seguimientos: transformarSeguimiento(registroAntiguo, archivoSegPdf)
                    };

                    const result = await MiModeloNuevo.updateOne(
                        { _id: nuevoRegistro._id },
                        { $set: { ...nuevoRegistro, updatedAt: registroAntiguo.updatedAt }, $setOnInsert: { createdAt: registroAntiguo.createdAt } },
                        { upsert: true }
                    );
                    return result.modifiedCount + result.upsertedCount;
                } catch (errorTransformacion) {
                    await log(`Error al transformar/escribir registro con _id: ${registroAntiguo._id}: ${errorTransformacion}`);
                    registrosConError++;
                    return 0;
                }
            });

            const resultadosBulkWrite = await Promise.all(promesasBulkWrite);
            registrosMigrados += resultadosBulkWrite.reduce((sum, count) => sum + count, 0);

            await log(`Migrados/Upserted ${registrosMigrados} registros (Lote ${offset / BATCH_SIZE + 1}).`);

            offset += BATCH_SIZE;
        }

        await log(`Migración completada. Registros migrados/upserted: ${registrosMigrados}. Registros con error: ${registrosConError}.`);
        mongoose.disconnect();
        await log('Conexión a MongoDB cerrada.');
    } catch (error) {
        await log(`Error general durante la migración: ${error}`);
        mongoose.disconnect();
    }
}

// Funciones de utilidad (fuera del bucle principal para mejor legibilidad)

function transformarUsuario(usuarioAntiguo) {
    if (!usuarioAntiguo) return null;
    return {
        id: usuarioAntiguo.id ? new ObjectId(usuarioAntiguo.id) : null,
        username: usuarioAntiguo.username || "",
        email: usuarioAntiguo.email || "",
        // accessToken: usuarioAntiguo.accessToken || "", // No se recomienda guardar esto
    };
}

function transformarSeguimiento(registroAntiguo, archivoSegPdf) {
    // if (!registroAntiguo.seg_oficio_salida) return null;
    return {
        oficio_salida: registroAntiguo.seg_oficio_salida || "",
        fecha_oficio_salida: convertirFecha(registroAntiguo.seg_fecha_oficio_salida),
        fecha_acuse_recibido: convertirFecha(registroAntiguo.seg_fecha_acuse_recibido),
        usuario: transformarUsuario(registroAntiguo.seg_editor_user_exit),
        comentarios: registroAntiguo.seg_atencion_otorgada || "",
        archivosPdf_seguimiento: archivoSegPdf ? [archivoSegPdf] : [],
        num_expediente: registroAntiguo.seg_num_expediente || "",
        destinatario: registroAntiguo.seg_destinatario || "",
        cargo: registroAntiguo.seg_cargo || "",
        atencion_otorgada: registroAntiguo.seg_atencion_otorgada || "",
        anexo: registroAntiguo.seg_anexo || "",
        estatus: registroAntiguo.seg_estatus || "",
        firma_visado: registroAntiguo.seg_firma_visado || ""
    };
}

migrarDatos();