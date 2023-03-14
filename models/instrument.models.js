const mongoose = require("mongoose");

const Instruments = mongoose.model(
    "Instruments",
    new mongoose.Schema({
        name: {
            type: String,
            uppercase: true,
            unique: true
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

module.exports = Instruments;