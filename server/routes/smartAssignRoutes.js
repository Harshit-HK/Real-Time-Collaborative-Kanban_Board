import express from "express";
import { smartAssignTaskController } from "../controllers/smartAssignController.js";
import authMiddleware from "../middleware/authMiddleware.js";


const router = express.Router();

router.post("/:taskId", authMiddleware, smartAssignTaskController);

export default router;
