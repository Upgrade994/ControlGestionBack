const Institution = require ("../models/institution.models");
const mongoose = require('mongoose');

const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

exports.getAllNoDeletedInstitution = async (req, res) => {
    try {
        const institutions = await Institution.find({ deleted: false }).sort({ name: 1 }).lean().exec();
        res.status(200).json({ status: 'success', institutions });
    } catch (error) {
        console.error("Error obteniendo las instituciones:", error);
        res.status(500).json({ status: 'error', message: 'Error al obtener las instituciones' });
    }
}

exports.saveInstitution = async (req, res) => {
    try {
        if (!req.body.institution) {
            return res.status(400).json({ status: 'error', message: 'El nombre del área es requerido' });
        }

        const institucionExistente = await Institution.findOne({ institution: req.body.institution });
        if (institucionExistente) {
            return res.status(400).json({ status: 'error', message: 'Ya existe un área con ese nombre' });
        }

        const nuevaInstitucion = new Institution({ institution: req.body.institution });
        const institucionGuardada = await nuevaInstitucion.save();

        res.status(201).json({ status: 'success', message: 'Área creada con éxito', institution: institucionGuardada });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const erroresValidacion = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ status: 'error', message: erroresValidacion });
        }
        console.error("Error guardando el área:", error);
        res.status(500).json({ status: 'error', message: 'Error al guardar el área' });
    }
};

exports.updateInstitution = async (req, res) => {
    try {
      const id = req.params.id;

      if (!isValidObjectId(id)) {
          return res.status(400).json({ status: 'error', message: 'ID de área no válido' });
      }

        if (!req.body.institution) {
            return res.status(400).json({ status: 'error', message: 'El nombre del área es requerido' });
        }

        const institucionExistente = await Institution.findOne({ institution: req.body.institution, _id: { $ne: id } });
        if (institucionExistente) {
            return res.status(400).json({ status: 'error', message: 'Ya existe un área con ese nombre' });
        }

        const institucionActualiada = await Institution.findByIdAndUpdate(id, { institution: req.body.institution }, { new: true, runValidators: true });

        if (!institucionActualiada) {
            return res.status(404).json({ status: 'error', message: 'Área no encontrada' });
        }

        res.status(200).json({ status: 'success', message: 'Área actualizada con éxito', institution: institucionActualiada });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const erroresValidacion = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ status: 'error', message: erroresValidacion });
        }
        console.error("Error actualizando el área:", error);
        res.status(500).json({ status: 'error', message: 'Error al actualizar el área' });
    }
};
