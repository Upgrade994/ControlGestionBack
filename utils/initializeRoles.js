const db = require("../models");
const Role = db.role;

async function initializeRoles() {
    try {
        const count = await Role.estimatedDocumentCount();
        if (count === 0) {
            await Role.create([
                { name: "user" },
                { name: "linker" },
                { name: "moderator" },
                { name: "admin" }
            ]);
            console.log("Added roles to collection");
        }
    } catch (error) {
        console.error("Error initializing roles:", error);
    }
}

module.exports = initializeRoles;