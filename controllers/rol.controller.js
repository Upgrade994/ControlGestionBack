const Role = require("../models/role.models");

exports.getAdminRoles = async (req, res) => {
  try {
    const roles = await Role.find({ admin: true }).exec(); // Filter by admin: true

    if (!roles || roles.length === 0) { // Check for empty array as well
      return res.status(404).json({
        status: 'error',
        message: 'No admin roles found' // More specific message
      });
    }

    res.status(200).json({ // Use .json for consistency
      status: 'success',
      roles // Send the roles directly, no need to wrap in 'role'
    });
  } catch (error) {
    console.error("Error fetching admin roles:", error); // Log the actual error
    res.status(500).json({
      status: 'error',
      message: 'Error fetching admin roles' // Generic message for the client
    });
  }
};

exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find({ admin: false }).exec();

    if (!roles || roles.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No roles found'
      });
    }

    res.status(200).json({
      status: 'success',
      roles
    });
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching roles'
    });
  }
};

exports.createRole = async (req, res) => {
    try {
        if (!req.body.name) {
            return res.status(400).json({message: "Role name is required"})
        }

        const existingRole = await Role.findOne({ name: req.body.name });
        if (existingRole) {
          return res.status(400).json({ message: "Role name is already in use!" });
        }

        const role = new Role({
            name: req.body.name,
            admin: req.body.admin || false // Default to false if not provided
        });

        const savedRole = await role.save();
        res.status(201).json({ message: "Role created successfully!", role: savedRole });
    } catch (error) {
        console.error("Error creating role:", error);
        res.status(500).json({ message: "Error creating role" });
    }
}