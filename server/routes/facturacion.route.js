import express from 'express';
import { emitirComprobante } from '../controllers/facturacion.controller.js';

const router = express.Router();

router.post('/', emitirComprobante);

export default router;
