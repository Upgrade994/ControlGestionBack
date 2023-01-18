const Input = require("../models/input.models");

exports.getInputs = async (req, res) => {
    const query = Input.find({});

    query.exec((err, input) => {
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
}