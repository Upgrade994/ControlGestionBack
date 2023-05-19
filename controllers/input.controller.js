const Input = require("../models/input.models");
var validator = require("validator");
const ExcelReport = require('../services/ExcelDailyReport.js')
const ExcelResumeReport = require('../services/ExcelResumeReport.js')

//Get all no deleted documents in collection
exports.getNoDeletedInputs = async (req, res) => {

    await new Promise((resolve) => {
        Input.find({ "deleted": false }).exec((err, input) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver el registro!'
                });
            }
            if (!input) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No existen registros!'
                });
            }
            return res.status(200).send({
                status: 'success',
                input
            });
        });
    });
},

//Get all deleted documents in collection
exports.getDeletedInputs = async (req, res) => {

    await new Promise((resolve) => {
        Input.find({ "deleted": true }).exec((err, input) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver el registro!'
                });
            }
            if (!input) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No existen registros!'
                });
            }
            return res.status(200).send({
                status: 'success',
                input
            });
        });
    });
},

//Get only one
exports.getInput = async (req, res) => {
    const inputId = req.params.id;

    if(!inputId || inputId == null) {
        return res.status(404).send({
            status: 'error',
            message: 'No existe el registro.'
        });
    }

    Input.findById(inputId, (err, input) => {
        // console.log("find");
        if (err || !input) {
            return res.status(404).send({
                status: 'error',
                message: 'No existe el registro.'
            });
        }

        return res.status(200).send({
            status: 'success',
            input
        })
    });
},

//Save document
exports.saveInput = async (req, res) => {
    var params = req.body;

    try {
        var validate_folio = !validator.isInt('$params.folio');
    } catch (error) {
        return res.status(200).send({
            message: 'Faltan datos por enviar.'
        });
    }

    if (
        validate_folio
    ) {
        const input = new Input();

        input.anio = params.anio;
        input.folio = params.folio;
        input.num_oficio = params.num_oficio;
        input.fecha_oficio = params.fecha_oficio;
        input.fecha_recepcion = params.fecha_recepcion;
        input.hora_recepcion = params.hora_recepcion;
        input.fecha_vencimiento = params.fecha_vencimiento;
        input.instrumento_juridico = params.instrumento_juridico;
        input.remitente = params.remitente;
        input.institucion_origen = params.institucion_origen;
        input.asunto = params.asunto;
        input.asignado = params.asignado;
        input.estatus = params.estatus;
        input.observacion = params.observacion;
        input.create_user = params.create_user;
        input.edit_count = params.edit_count;
        input.deleted = params.deleted;
        input.pdfString = params.pdfString;

        await input.save((err, inputStored) => {
            if (err || !inputStored) {
                return res.status(404).send({
                    status: "error",
                    message: "El registro no se ha guardado"
                });
            }
            return res.status(200).send({
                status: "Success",
                input: inputStored
            });
        });

    } else {
        return res.status(424).send({
            status: "error",
            message: "El registro no es valido"
        });
    }
},

//Update one
exports.updateInput = async (req, res) => {
    var inputId = req.params.id;
    var params = req.body;

    try {
        var validate_anio = !validator.isEmpty('$params.anio');
        var validate_folio = !validator.isEmpty('$params.folio');
    } catch (error) {
        return res.status(404).send({
            status: 'error',
            message: 'Faltan datos por enviar'
        });
    }

    if (
        validate_anio && validate_folio
    ) {
        await Input.findOneAndUpdate({_id: inputId}, params, {new:true}, (err, inputUpdated) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al actualizar'
                });
            }

            if (!inputUpdated) {
                return res.status(404).send({
                    status: 'error',
                    input: inputUpdated
                });
            }

            return res.status(200).send({
                status: 'success',
                message: 'Ok'
            });
        });
    } else {
        return res.status(500).send({
            status: 'error',
            message: 'La validacion no es correcta'
        });
    }
},

//Delete one
exports.deleteInput = async (req, res) => {
    var inputId = req.params.id;

    await Input.findByIdAndDelete({_id: inputId}, (err, inputRemoved) => {
        if (err) {
            return res.status(500).send({
                status: 'error',
                message: 'Error al borrar el registro'
            });
        }
        if (!inputRemoved) {
            return res.status(404).send({
                status: 'error',
                message: 'No existe el registro'
            });
        }
        console.log("Registro eliminado: ", inputRemoved);
        return res.status(200).send({
            status: 'success',
            input: inputRemoved
        });
    });
},

exports.findInput = async (req, res) => {
    const searchInput = req.params.search;
    // console.log(searchInput);
    
    Input.find({
        "$or":[
            { num_oficio: { $regex: searchInput, $options:"i" }},
            { asunto: { $regex: searchInput, $options:"i" }}
        ]
    }).exec((err, inputs) =>{
        console.log(err);
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

exports.getAreasPerDay = async (req, res) => {
    try {

        const searchDay = req.params.search;
        
        const aggregationResult = await Input.aggregate([
          { $match: { fecha_recepcion: { $regex: searchDay, $options: "i" }}},
          { $group: {
              _id: '$asignado',
              cantidad: {$sum: 1},
              asunto: { $push: '$asunto' }
          }} 
        ]);
      
        if (!aggregationResult || aggregationResult.length === 0) {
          return res.status(404).send({
            status: 'error',
            message: 'No se encontraron resultados'
          });
        }
      
        return res.status(200).json(aggregationResult)

      } catch (error) {

        return res.status(500).send({
          status: 'error',
          message: 'Error al buscar'
        });
      }
}

exports.reporteResumen = async (req, res) => {
    const searchInput = req.params.search;

    const aggregationResult = await Input.aggregate([
        { $match: {
            $or : [
              { "fecha_recepcion": searchInput},
              { "remitente": searchInput},
            ]}
          },
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
}

exports.reporteDiario = async (req, res) => {
    let searchDay = req.params.search;

    //En caso de que la fecha sea empty string, false, 0, null, undefined, etc...
    if(!searchDay){
        searchDay = new Date().toJSON().slice(0, 10) //Asignar la fecha actual
    }

    //Busqueda de filtro desde las 00:00 hasta las 23:59 del dia enviado
    const aggregationResult = await Input.find({
        fecha_recepcion: {
            $gte: searchDay.split("T")[0]+"T00:00", 
            $lt: searchDay.split("T")[0]+"T23:59"
        }
    });

    const workbook = ExcelReport(aggregationResult);
    
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
}