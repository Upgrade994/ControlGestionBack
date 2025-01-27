const Input = require("../models/inputs.models");
var validator = require("validator");
const ExcelReport = require('../services/ExcelDailyReport.js');
const ExcelResumeReport = require('../services/ExcelResumeReport.js');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ObjectId } = require('mongodb');

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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    try {
        const query = { deleted: false, asignado: areaUsuario };
        let searchRegex = null;

        if (search) {
            const searchAsNumber = Number(search);

            if (!isNaN(searchAsNumber)) {
                query.folio = searchAsNumber;
            } else {
                try {
                    searchRegex = new RegExp(search, 'i'); // 'i' para búsqueda insensible a mayúsculas/minúsculas
                } catch (e) {
                    return res.status(400).json({
                        status: 'error',
                        message: 'Expresión de búsqueda no válida.',
                    });
                }
                query.$or = [
                    { num_oficio: { $regex: searchRegex } },
                    { asunto: { $regex: searchRegex } },
                    { estatus: { $regex: searchRegex } },
                    { fecha_recepcion: { $regex: searchRegex } },
                    // Agrega aquí otros campos de texto en los que deseas buscar
                ];
            }
        }

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
            // archivosPdf: 1,
        };

        const inputs = await Input.find(query, projection)
            .sort({ anio: -1, createdAt: -1 })
            // .allowDiskUse(true)
            .skip(skip)
            .limit(limit)
            .lean();

        if (inputs.length === 0) {
            return res.status(204).json();
        }

        return res.status(200).json({
            status: 'success',
            inputs: inputs,
            totalInputs: totalInputs,
            totalPages: Math.ceil(totalInputs / limit),
            currentPage: page,
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