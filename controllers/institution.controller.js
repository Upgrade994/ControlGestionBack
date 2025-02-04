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
      if (!req.body.name) {
        return res.status(400).json({ status: 'error', message: 'El nombre de la institucion es requerido' });
      }
  
      const newInstitution = new Institution({
        name: req.body.name.toUpperCase(), // Convertir a mayúsculas
        deleted: false 
      });
  
      const savedInstitution = await newInstitution.save();
  
      res.status(201).json({ status: 'success', message: 'Institucion creado con éxito', instrument: savedInstitution });
  
    } catch (error) {
      if (error.code === 11000) { // Manejar error de duplicidad (índice único)
        return res.status(400).json({ status: 'error', message: 'Ya existe un institucion con ese nombre' });
      }
  
      console.error("Error guardando el institucion:", error);
      res.status(500).json({ status: 'error', message: 'Error al guardar el institucion' });
    }
  };

exports.updateInstitution = async (req, res) => {
    try {
        const { id } = req.params; 
        const { name } = req.body;
    
        const institution = await Institution.findByIdAndUpdate(id, { name }, { new: true }); 
    
        if (!institution) {
          return res.status(404).json({ status: 'error', message: 'Institucion no encontrado' });
        }
    
        res.status(200).json({ status: 'success', message: 'Institucion actualizado con éxito', institution });
    } catch (error) {
        console.error("Error actualizando la institucion:", error);
        res.status(500).json({ status: 'error', message: 'Error al actualizar la institucion' });
    }
};

exports.getInstitutionById = async (req, res) => {
    try {
      const { id } = req.params; 
  
      const institution = await Institution.findById(id);
  
      if (!institution) {
        return res.status(404).json({ status: 'error', message: 'Institucion no encontrado' });
      }
  
      res.status(200).json({ status: 'success', institution });
    } catch (error) {
      console.error("Error obteniendo el institucion:", error);
      res.status(500).json({ status: 'error', message: 'Error al obtener el institucion' });
    }
};
