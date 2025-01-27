const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;

const verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];

    if (!token) {
        return res.status(403).json({ message: "No token provided!" }); // Usar json()
    }

    jwt.verify(token, config.secret, (err, decoded) => { // Usar callback para evitar async/await innecesario
        if (err) {
            console.error("Token verification error:", err); // Log detallado del error
            return res.status(401).json({ message: "Unauthorized!" }); // Usar json()
        }
        req.userId = decoded.id;
        next();
    });
};

const checkRole = (roleName) => async (req, res, next) => { // Función genérica para verificar roles
    try {
        const user = await User.findById(req.userId).populate("roles").lean(); // populate y lean para eficiencia
        if (!user) {
            return res.status(401).json({ message: "Unauthorized!" });
        }

        const hasRole = user.roles.some(role => role.name === roleName);
        if (hasRole) {
            next();
        } else {
            return res.status(403).json({ message: `Require ${roleName} Role!` });
        }
    } catch (err) {
        console.error(`Error checking ${roleName} role:`, err);
        return res.status(500).json({ message: "Internal Server Error!" });
    }
};

const isAdmin = checkRole("admin");
const isModerator = checkRole("moderator");
const isLinker = checkRole("linker");


const authJwt = {
    verifyToken,
    isAdmin,
    isModerator,
    isLinker
};

module.exports = authJwt;