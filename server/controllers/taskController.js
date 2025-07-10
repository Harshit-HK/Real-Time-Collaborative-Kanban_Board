import TaskModel from "../models/TaskModel.js";
import UserModel from "../models/UserModel.js";
import ActionLogModel from "../models/ActionLogModel.js";
import logRecentAction from "../utils/logRecentAction.js";
import logAction from "../utils/logGroupedAction.js";
import { assignTaskToUser } from "../services/taskAssigner.js";

// Create a task
export const createTask = async (req, res) => {
  try {
    const { title, description, priority, status, assignedTo } = req.body;

    const existing = await TaskModel.findOne({ title });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Task title already exists." });
    }else if(title === "Todo" || title === "In Progress" || title === "Done"){
      return res
        .status(400)
        .json({ success: false, message: "Title must not be the same as the column name." });
    }

    const createdTask = await TaskModel.create({
      title,
      description,
      priority,
      createdBy: req.userId,
      status,
      ...(assignedTo && { assignedTo }),
    });

    // re-fetch with populate
    const newTask = await TaskModel.findById(createdTask._id).populate(
      "assignedTo",
      "name email"
    );

    const logs = {
      actionType: "create",
      taskId: newTask._id,
      performedBy: req.userId,
      details: `Created task "${title}"`,
    };

    await logAction({ ...logs });
    await logRecentAction({ ...logs });

    const io = req.app.get("io");
    io.emit("taskCreated", newTask);
    res.status(201).json({ success: true, task: newTask });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all tasks (global)
export const getAllTasks = async (req, res) => {
  try {
    const tasks = await TaskModel.find()
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update task
export const updateTask = async (req, res) => {
  const { taskId } = req.params;
  const title = req.body.title
  
  if(title === "Todo" || title === "In Progress" || title === "Done"){
      return res
        .status(400)
        .json({ success: false, message: "Title must not be the same as the column name." });
    }
    
  try {
    const updatedTask = await TaskModel.findByIdAndUpdate(taskId, req.body, {
      new: true,
    }).populate("assignedTo", "name email");

    if (!updatedTask) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    const logs = {
      actionType: "update",
      taskId,
      performedBy: req.userId,
      details: req.body.details || `Updated task "${updatedTask.title}"`,
      comment: req.body.comment || "",
    };

    await logAction({ ...logs });
    await logRecentAction({ ...logs });

    const io = req.app.get("io");
    io.emit("taskUpdated", updatedTask);
    res.status(200).json({ success: true, task: updatedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete task
export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const deletedTask = await TaskModel.findByIdAndDelete(taskId);

    if (!deletedTask) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    // Log deletion
    await logRecentAction({
      actionType: "delete",
      taskId,
      performedBy: req.userId,
      details: `Deleted task "${deletedTask.title}"`,
    });

    const io = req.app.get("io");
    io.emit("taskDeleted", taskId);
    res.status(200).json({ success: true, message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Assign task
export const assignTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { userId } = req.body;

    const result = await assignTaskToUser(taskId, userId, req.userId);

    if (result?.alreadyAssigned) {
      return res.status(200).json({
        success: false,
        message: result.message,
        alreadyAssigned: true,
      });
    }
    const populatedTask = result;

    const logs = {
      actionType: "assign",
      taskId,
      performedBy: req.userId,
      details: `Assigned task "${populatedTask.title}" to ${populatedTask.assignedTo.name}`,
    };

    await logAction({ ...logs });
    await logRecentAction({ ...logs });

    const io = req.app.get("io");
    io.emit("taskAssigned", populatedTask);
    io.to(populatedTask.assignedTo._id.toString()).emit("taskAssignedToYou", populatedTask);

    res.status(200).json({ success: true, task: populatedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get my tasks logged-in-user
export const getMyTasks = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Get assignedProjects array (task IDs)
    const assignedTaskIds = user.assignedProjects;
    // Fetch all tasks with matching IDs
    const tasks = await TaskModel.find({ _id: { $in: assignedTaskIds } })
      .sort({
        createdAt: -1,
      })
      .populate("assignedTo", "name email");

    res.status(200).json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get task's logs
export const getLogs = async (req, res) => {
  const { taskTitle } = req.params;

  try {
    const logDoc = await ActionLogModel.findOne({ title: taskTitle }).populate(
      "logs.performedBy",
      "name email"
    );

    if (!logDoc) {
      return res
        .status(404)
        .json({ success: false, message: "No logs found for this task" });
    }

    const sortedLogs = logDoc.logs
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20);

    res.status(200).json({ success: true, logs: sortedLogs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching logs" });
  }
};

// Generating Drag and drop logs

export const dragAndDrop = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { newStatus } = req.body;

    const task = await TaskModel.findById(taskId);
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    const oldStatus = task.status;

    // No change? Ignore
    if (oldStatus === newStatus) {
      return res
        .status(200)
        .json({ success: true, message: "No status change" });
    }

    task.status = newStatus;
    await task.save();

    const logs = {
      actionType: "Drag & Drop",
      taskId,
      performedBy: req.userId,
      details: `Status changed `,
      comment: `Moved task '${task.title}' from '${oldStatus}' to '${newStatus}'`,
    };

    await logAction({ ...logs });
    await logRecentAction({ ...logs });

    // Emit socket update if using real-time
    const io = req.app.get("io");
    const populatedTask = await TaskModel.findById(taskId).populate(
      "assignedTo",
      "name email"
    );
    io.emit("taskUpdated", populatedTask);

    res.status(200).json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
