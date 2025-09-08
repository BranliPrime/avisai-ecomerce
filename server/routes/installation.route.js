import express from "express";
import { getInstallationStatus, createInstallation,getInstallationSummary, } from "../controllers/installation.controller.js";

const router = express.Router();

router.get("/status", getInstallationStatus);
router.post("/create", createInstallation);
router.get("/home/:userId", getInstallationSummary);

export default router;
