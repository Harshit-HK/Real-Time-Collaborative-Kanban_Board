import express from "express";
import { getRecentActions } from "../controllers/recentActionsController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getRecentActions);

export default router;
