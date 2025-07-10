import TaskModel from "../models/TaskModel.js";
import logAction from "../utils/logGroupedAction.js";
import logRecentAction from "../utils/logRecentAction.js";
import { assignTaskToUser } from "../services/taskAssigner.js";

import {
  assignLowOrMediumPriorityTask,
  assignHighPriorityTask,
} from "../services/smartAssign/index.js";

export const smartAssignTaskController = async (req, res) => {
  const { taskId } = req.params;
  const performedBy = req.userId;

  try {
    const task = await TaskModel.findById(taskId);
    if (!task)
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });

    // Determine which algorithm to use
    let result;
    if (task.priority === "High") {
      result = await assignHighPriorityTask();
    } else {
      result = await assignLowOrMediumPriorityTask();
    }

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }

    const assignResult = await assignTaskToUser(
      taskId,
      result.userId,
      performedBy,
    );

    // if same user
    if (assignResult?.alreadyAssigned) {
      return res.status(200).json({
        success: false,
        message: assignResult.message,
        alreadyAssigned: true,
      });
    }
    const populatedTask = assignResult;

    const logs = {
      actionType: "Smart Assign",
      taskId,
      performedBy: req.userId,
      details: `Assigned task "${populatedTask.title}" to ${populatedTask.assignedTo.name}`,
    };
    await logAction({ ...logs });
    await logRecentAction({ ...logs });

    const io = req.app.get("io");
    io.emit("taskUpdated", populatedTask); 
    io.emit("logUpdated", {
      title: task.title,
      newLog: {
        ...logs,
        createdAt: new Date(),
        performedBy: req.userId,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Task '${task.title}' assigned to ${populatedTask.assignedTo.name}`,
      updatedTask: populatedTask,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
