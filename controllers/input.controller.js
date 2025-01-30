const Input = require("../models/inputs.models");
var validator = require("validator");
const ExcelReport = require('../services/ExcelDailyReport.js');
const ExcelResumeReport = require('../services/ExcelResumeReport.js');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ObjectId } = require('mongodb');

exports.getPdfsByIdInput = async (req, res) => {
    try {
        const { id } = req.params;

        // Validación y búsqueda del registro
        const input = await Input.findById(id);
        if (!input) {
            return res.status(404).json({ error: 'Registro no encontrado' });
        }

        // Obtener el array de rutas y transformarlo en un array de objetos con más información
        const pdfData = input.archivosPdf.map(path => ({
            path,
            name: path.split('\\').pop(), // Obtener el nombre del archivo
            size: fs.statSync(path).size // Obtener el tamaño del archivo
        }));

        return res.json(pdfData);
    } catch (error) {
        console.error('Error al obtener la lista de PDFs:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

exports.getPdfByIdInput = async (req, res) => {
    try {
        const { id } = req.params;
        const { filename } = req.query;

        const input = await Input.findById(id);
        if (!input) {
            return res.status(404).json({ error: 'Registro no encontrado' });
        }

        const pdfPath = input.archivosPdf.find(path => path.endsWith(filename));
        if (!pdfPath) {
            return res.status(404).json({ error: 'Archivo no encontrado' });
        }

        // 1. Construir la ruta completa (usando una ruta base)
        const fullPdfPath = path.join(pdfPath);

        // 2. Verificar si el archivo existe ANTES de crear el stream
        const fs = require('fs'); // Importa el módulo fs
        if (!fs.existsSync(fullPdfPath)) {
            console.error('Archivo no encontrado:', fullPdfPath);
            return res.status(404).json({ error: 'Archivo no encontrado' });
        }

        // 3. Manejo de errores en el stream
        res.setHeader('Content-Type', 'application/pdf');
        fs.createReadStream(fullPdfPath)
            .on('error', (err) => {
                if (err.code === 'ENOENT') {
                    console.error('Archivo no encontrado:', fullPdfPath);
                    return res.status(404).json({ error: 'Archivo no encontrado' });
                }
                console.error('Error al leer el archivo PDF:', err);
                res.status(500).json({ error: 'Error interno del servidor' });
            })
            .pipe(res); // El pipe va DESPUÉS del manejo de errores

    } catch (error) {
        console.error('Error al servir el archivo PDF:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

exports.getPdfByIdSeguimiento = async (req, res) => {
    try {
        const { id } = req.params;
        const { filename } = req.query;

        // Validación y búsqueda del registro
        const input = await Input.findById(id);
        if (!input) {
            return res.status(404).json({ error: 'Registro no encontrado' });
        }

        // Encontrar el archivo específico
        const pdfPath = input.seguimientos.archivosPdf_seguimiento.find(path => path.endsWith(filename));
        if (!pdfPath) {
            return res.status(404).json({ error: 'Archivo no encontrado' });
        }

        // 1. Construir la ruta completa (usando una ruta base)
        const fullPdfPath = path.join(pdfPath);

        // 2. Verificar si el archivo existe ANTES de crear el stream
        const fs = require('fs'); // Importa el módulo fs
        if (!fs.existsSync(fullPdfPath)) {
            console.error('Archivo no encontrado:', fullPdfPath);
            return res.status(404).json({ error: 'Archivo no encontrado' });
        }

        // 3. Manejo de errores en el stream
        res.setHeader('Content-Type', 'application/pdf');
        fs.createReadStream(fullPdfPath)
            .on('error', (err) => {
                if (err.code === 'ENOENT') {
                    console.error('Archivo no encontrado:', fullPdfPath);
                    return res.status(404).json({ error: 'Archivo no encontrado' });
                }
                console.error('Error al leer el archivo PDF:', err);
                res.status(500).json({ error: 'Error interno del servidor' });
            })
            .pipe(res); // El pipe va DESPUÉS del manejo de errores
    } catch (error) {
        console.error('Error al servir el archivo PDF:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

//Traer todos los registros con privilegios de enlace, informacion por area 08/01/2025 (FUNCIONANDO Y TERMINADO)
exports.getNoDeletedInputsByNormalUsers = async (req, res) => {
    let areaUsuario;

    // Determinar cómo se proporciona el área (prioridad: query > params > body)
    if (req.query.area) {
        areaUsuario = req.query.area;
    } else if (req.params.area) {
        areaUsuario = req.params.area;
    } else if (req.body.area) {
        areaUsuario = req.body.area;
    } else {
        return res.status(400).json({
            status: 'error',
            message: 'El parámetro "area" es requerido (query, params o body).',
        });
    }

    try {
        const query = { deleted: false, asignado: areaUsuario };

        const totalInputs = await Input.countDocuments(query); // Contar documentos con el filtro

        const projection = {
            anio: 1,
            folio: 1,
            num_oficio: 1,
            fecha_recepcion: 1,
            asignado: 1,
            asunto: 1,
            estatus: 1,
            _id: 1,
            'seguimientos.atencion_otorgada': 1,
        };

        const inputs = await Input.find(query, projection)
            .sort({ anio: -1, folio: -1, fecha_recepcion: -1, createdAt: -1 })
            // .allowDiskUse(true)
            // .skip(skip)
            // .limit(limit)
            .lean();

        if (inputs.length === 0) {
            return res.status(204).json();
        }

        return res.status(200).json({
            status: 'success',
            inputs: inputs,
            totalInputs: totalInputs,
        });
    } catch (error) {
        console.error("Error en getNoDeletedInputsByNormalUsers:", error);
        return res.status(500).json({
            status: 'error',
            message: 'Error al devolver el registro.',
        });
    }
};

//Traer todos los registros con todos los privilegios posibles 07/01/2025 (FUNCIONANDO Y TERMINADO)
exports.getNoDeletedInputs = async (req, res) => {
    try {
        const query = { deleted: false };

        const projection = {
            anio: 1,
            folio: 1,
            num_oficio: 1,
            fecha_recepcion: 1,
            asignado: 1,
            asunto: 1,
            estatus: 1,
            _id: 1,
            'seguimientos.atencion_otorgada': 1,
        };
        // console.log(projection);
        const totalInputs = await Input.countDocuments(query);
        
        const inputs = await Input.find(query, projection)
            .sort({ anio: -1, folio: -1, fecha_recepcion: -1, createdAt: -1 })
            .lean();

        if (inputs.length === 0) {
            return res.status(204).json({
            status: 'error',
            message: 'No existen registros!',
            });
        }

        return res.status(200).json({
            status: 'success',
            inputs: inputs,
            totalInputs: totalInputs,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 'error',
            message: 'Error al devolver el registro.',
        });
    }
},

//Crear registros de entrada 21/01/2025 (FUNCIONANDO Y TERMINADO)
exports.createInput = async (req, res) => {
    try {
        // 1. Validar la entrada (puedes usar express-validator para algo más complejo) || !req.body.create_user
        if (!req.body.anio || !req.body.folio || !req.body.fecha_recepcion || !req.body.create_user ) {
            return res.status(400).json({
                status: 'error',
                message: 'Los campos año, folio y fecha_recepcion son requeridos.',
            });
        }

        // 2. Validar que el usuario que crea exista
        if (!ObjectId.isValid(req.body.create_user.id)) {
            return res.status(400).json({
                status: 'error',
                message: 'El id del usuario no es valido.',
            });
        }

        // 3. Crear el nuevo registro
        const newinput = new Input({
            anio: req.body.anio,
            folio: req.body.folio,
            num_oficio: req.body.num_oficio,
            fecha_oficio: req.body.fecha_oficio,
            fecha_vencimiento: req.body.fecha_vencimiento,
            fecha_recepcion: req.body.fecha_recepcion,
            hora_recepcion: req.body.hora_recepcion,
            instrumento_juridico: req.body.instrumento_juridico,
            remitente: req.body.remitente,
            institucion_origen: req.body.institucion_origen,
            asunto: req.body.asunto,
            asignado: req.body.asignado,
            estatus: req.body.estatus,
            observacion: req.body.observacion,
            archivosPdf: req.body.archivosPdf || [],
            create_user: req.body.create_user,
            editor_user: req.body.editor_user,
            edit_count: req.body.edit_count || 0,
            deleted: req.body.deleted || false,
        });

        // 4. Guardar el registro en la base de datos
        const savedInput = await newinput.save();

        // 5. Responder al cliente
        res.status(201).json({
            status: 'success',
            input: savedInput,
            message: 'Registro creado exitosamente.',
        });
    } catch (error) {
        console.error("Error en createInput:", error);

        if (error.name === 'ValidationError') { 
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ status: 'error', message: errors });
        }

        if (error.code === 11000 && error.keyPattern && error.keyPattern.num_oficio) {
            return res.status(400).json({ status: 'error', message: 'El número de oficio ya existe.' });
        }

        res.status(500).json({
            status: 'error',
            message: 'Error al crear el registro.',
        });
    }
};

// Buscar registros pos id 22/01/2025 (FUNCIONANDO Y TERMINADO)
exports.getInputById = async (req, res) => {
    try {
        const inputId = req.params.id;

        // 1. Validar que el ID sea un ObjectId válido
        if (!ObjectId.isValid(inputId)) {
            return res.status(400).json({ status: 'error', message: 'ID de registro inválido.' });
        }

        // 2. Buscar el registro por ID y popular los campos de usuario
        const input = await Input.findById(inputId).populate('create_user').populate('editor_user').lean();

        // 3. Manejar el caso en que no se encuentra el registro
        if (!input) {
            return res.status(404).json({ status: 'error', message: 'Registro no encontrado.' });
        }

        // 4. Responder con el registro encontrado
        res.status(200).json({ status: 'success', input });
    } catch (error) {
        console.error("Error en getInputById:", error);
        res.status(500).json({ status: 'error', message: 'Error al obtener el registro.' });
    }
};

exports.getDuplicatedOficiosByInputId = async (req, res) => {
    try {
        const inputId = req.params.id;

        // 1. Validar que el ID sea un ObjectId válido
        if (!ObjectId.isValid(inputId)) {
            return res.status(400).json({ status: 'error', message: 'ID de registro inválido.' });
        }

        const aggregationPipeline = [
            {
                $match: { _id: new ObjectId(inputId), deleted: false } // Filtra primero por el inputId
            },
            {
                $lookup: { // Nueva etapa $lookup para traer los documentos originales
                    from: "inputs", // Nombre de tu colección
                    let: { num_oficio: "$num_oficio" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$num_oficio", "$$num_oficio"] }
                            }
                        },
                        {
                            $project: { // Proyecta los campos que necesitas
                                _id: 1,
                                num_oficio: 1,
                                folio: 1,
                                asignado: 1
                            }
                        }
                    ],
                    as: "duplicados"
                }
            },
            {
                $unwind: "$duplicados" // Desenrolla el array de duplicados para que cada documento esté en su propio objeto
            },
            {
                $group: { // Agrupa por num_oficio para mostrar todos los documentos con el mismo num_oficio
                    _id: "$duplicados.num_oficio",
                    num_oficio: { $first: "$duplicados.num_oficio" },
                    duplicados: { $push: "$duplicados" }
                }
            },
            {
                $project: { // Da formato a la salida
                    _id: 0,
                    num_oficio: 1,
                    duplicados: 1
                }
            }
        ];

        const result = await Input.aggregate(aggregationPipeline);

        // 3. Responder con los resultados
        res.status(200).json({ status: 'success', duplicados: result });

    } catch (error) {
        console.error("Error en getDuplicatedOficiosByInputId:", error);
        res.status(500).json({ status: 'error', message: 'Error al obtener los números de oficio duplicados.' });
    }
};

// Actualizar registros por id 22/01/2025 (FUNCIONANDO Y TERMINADO)
exports.updateInputById = async (req, res) => {
    try {
        const inputId = req.params.id;

        if (!ObjectId.isValid(inputId)) {
            return res.status(400).json({ status: 'error', message: 'ID de registro inválido.' });
        }

        // 1. Buscar el documento *antes* de actualizarlo para obtener el valor actual de edit_count
        const existingInput = await Input.findById(inputId);

        if (!existingInput) {
            return res.status(404).json({ status: 'error', message: 'Registro no encontrado.' });
        }

        // 2. Incrementar edit_count
        const newEditCount = (existingInput.edit_count || 0) + 1;

        // 3. Realizar la actualización, incluyendo el nuevo valor de edit_count
        const updatedInput = await Input.findByIdAndUpdate(
            inputId,
            { $set: { ...req.body, edit_count: newEditCount } }, // Incluye edit_count en la actualización
            { new: true, runValidators: true }
        ).populate('create_user').populate('editor_user').lean();

        if (!updatedInput) {
            return res.status(404).json({ status: 'error', message: 'Registro no encontrado.' });
        }

        res.status(200).json({ status: 'success', input: updatedInput });
    } catch (error) {
        console.error("Error en updateInput:", error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ status: 'error', message: errors });
        }

        res.status(500).json({ status: 'error', message: 'Error al actualizar el registro.' });
    }
};

// NO TOCAR LAS ULTIMAS 4 FUNCIONES
exports.getAreasPerDay = async (req, res) => {
    const searchDay = req.params.search;

    await Input.aggregate([ 
        { $match: { fecha_recepcion: { $regex: searchDay, $options: "i" }}},
        { $group: {
            _id: '$asignado',
            cantidad: {$sum: 1},
            asunto: { $push: '$asunto' }
        }} 
    ]).exec((err, inputs) => {
        if (err) {
            return res.status(500).send({
                status: 'error',
                message: 'Error al buscar'
            });
        }
        if (!inputs || inputs.length <= 0 || inputs == null) {
            return res.status(404).send({
                status: 'error',
                message: 'No hay relaciones con tu busqueda'
            });
        }
        return res.status(200).send({
            status: 'success',
            inputs
        });
    });
},

exports.getEstatusPerArea = async (req, res) => {
    // const fechaInicio = req.params.fechaInicio;
    // const fechaFin = req.params.fechaFin;
    // console.log(req.params);

    try {
        const inputs = await Input.aggregate([
            { $match: {
                // fecha_recepcion: { $gte: fechaInicio , $lt: fechaFin },
                deleted: false
              }},{ $group: {
                _id: { asignado: "$asignado", estatus: "$estatus" },
                total: { $sum: 1 }
              }},
              // Proyectar los resultados para que se vean más legibles
              { $group: {
                _id: "$_id.asignado",
                data: {
                    $push: {
                        estatus: "$_id.estatus",
                        total: "$total"
                    }
                }
              }},
              // Ordenar por área y estado
              { $sort: {
                "_id": 1,
                "estatus.estatus": 1
              }}
          ]);

          if (!inputs || inputs.length <= 0 || inputs == null) {
            return res.status(404).send({
              status: "error",
              message: "No hay relaciones con tu busqueda",
            });
          }
      
          return res.status(200).send({
            status: "success",
            inputs,
          });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al buscar",
          });
    }
}

exports.reporteResumen = async (req, res) => {
    const searchInput = req.params.search;

    //El match por alguna razon no funcionaba con fechas anteriores de 2023
    const aggregationResult = await Input.aggregate([
        { $match: { fecha_recepcion: { $regex: searchInput, $options: "i" }}},
        { $group: {
            _id: '$asignado',
            cantidad: {$sum: 1},
            asunto: { $push: '$asunto' }
        }} 
    ]);

    const workbook = ExcelResumeReport(aggregationResult);

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=" + "data.xlsx"
      ); 
      await workbook.xlsx.write(res)
      return res.status(200).end();
    //   return res.status(200).json(aggregationResult)
}

exports.reporteDiario = async (req, res) => {
    let searchDay = req.params.search;
    // console.log(searchDay, '449');

    if (searchDay.length === 10) {
        // console.log(searchDay, 'if');
        // Consulta exacta por fecha
        const aggregationResult = await Input.find({
          fecha_recepcion: { $regex: searchDay, $options: "i" }
        }, { deleted: false }, { pdfString: 0 });
    
        const workbook = ExcelReport(aggregationResult);
    
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
    
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=" + "data.xlsx"
        );
    
        await workbook.xlsx.write(res);
    
        return res.status(200).end();
    } else {
        // console.log(searchDay, 'else');
        // Consulta por rango de fechas
        const [startDate, endDate] = req.params.search.split(' ');
    
        const aggregationResult = await Input.find({
          fecha_recepcion: { $gte: startDate, $lte: endDate }
        }, { deleted: false }, { pdfString: 0 });
    
        const workbook = ExcelReport(aggregationResult);
    
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
    
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=" + "data.xlsx"
        );
    
        await workbook.xlsx.write(res);
    
        return res.status(200).end();
      }

    // Optimizacion de la busqueda
    // const aggregationResult = await Input.find({
    //     fecha_recepcion: { $regex: searchDay, $options: "i" }
    // });

    // const workbook = ExcelReport(aggregationResult);
    
    // res.setHeader(
    //   "Content-Type",
    //   "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    // );
    
    // res.setHeader(
    //   "Content-Disposition",
    //   "attachment; filename=" + "data.xlsx"
    // );  

    // await workbook.xlsx.write(res)

    // return res.status(200).end();
}