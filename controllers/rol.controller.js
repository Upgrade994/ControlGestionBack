const Role = require ("../models/role.models");

// Get all admin roles
exports.getAdminRoles = async (req, res) => {
    Role.find({}).exec((err, role) => {
        if (err) {
            return res.status(500).send({
                status: 'error',
                message: 'Error al devolver el registro'
            });
        }
        if (!role) {
            return res.status(404).send({
                status: 'error',
                message: 'No existen registros'
            });
        }
        return res.status(200).send({
            status: 'success',
            role
        });
    });
}

// Get all normal roles
exports.getRoles = async (req, res) => {
    Role.find({ "admin": false }).exec((err, role) => {
        if (err) {
            return res.status(500).send({
                status: 'error',
                message: 'Error al devolver el registro'
            });
        }
        if (!role) {
            return res.status(404).send({
                status: 'error',
                message: 'No existen registros'
            });
        }
        return res.status(200).send({
            status: 'success',
            role
        });
    });
}