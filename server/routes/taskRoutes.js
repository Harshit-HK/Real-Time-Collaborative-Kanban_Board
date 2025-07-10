import express from "express";
import {
  createTask,
  getAllTasks,
  updateTask,
  deleteTask,
  assignTask,
  getMyTasks,
  dragAndDrop,
  getLogs,
} from "../controllers/taskController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createTask);
router.get("/all", authMiddleware, getAllTasks);
router.put("/update/:taskId", authMiddleware, updateTask);
router.delete("/delete/:taskId", authMiddleware, deleteTask);
router.put("/assign/:taskId", authMiddleware, assignTask);
router.get("/my", authMiddleware, getMyTasks);
router.put("/move/:taskId", authMiddleware, dragAndDrop);
router.get('/logs/:taskTitle', getLogs);
export default router;
