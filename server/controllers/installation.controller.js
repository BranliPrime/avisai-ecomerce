import Installation from "../models/installation.model.js";

// Obtener instalaciones de un técnico
export const getInstallationStatus = async (req, res) => {
  try {
    const { technicianId } = req.query; // <- aquí el cambio
    if (!technicianId) {
      return res.status(400).json({ message: "Technician ID is required" });
    }

    const installations = await Installation.find({ technicianId }).populate("orderId");
    res.json(installations);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener instalaciones", error: error.message });
  }
};

// Crear nueva instalación
export const createInstallation = async (req, res) => {
  try {
    const installation = await Installation.create(req.body);
    res.status(201).json(installation);
  } catch (error) {
    res.status(500).json({ message: "Error al crear instalación", error });
  }
};


export const getInstallationSummary = async (req, res) => {
  try {
    const { userId } = req.params;

    const [total, pendientes, enProgreso, completadas] = await Promise.all([
      Installation.countDocuments({ technicianId: userId }),
      Installation.countDocuments({ technicianId: userId, status: "pendiente" }),
      Installation.countDocuments({ technicianId: userId, status: "en_progreso" }),
      Installation.countDocuments({ technicianId: userId, status: "completada" }),
    ]);

    res.json({
      total,
      pendientes,
      enProgreso,
      completadas,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el resumen", error });
  }
};