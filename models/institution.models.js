const mongoose = require("mongoose");

const Institutions = mongoose.model(
    "Institutions",
    new mongoose.Schema({
        name: {
            type: String,
            uppercase: true
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

module.exports = Institutions;