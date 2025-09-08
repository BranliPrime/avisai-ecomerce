import express from "express"
import { consultarDocumentoSunat } from "../controllers/sunat.controller.js" // Asegúrate de que la ruta sea correcta

const router = express.Router()

router.get("/validar/:tipo/:numero", consultarDocumentoSunat)

export default router
