import TaskModel from "../models/TaskModel.js";
import UserModel from "../models/UserModel.js";
import logAction from "../utils/logGroupedAction.js";
import logRecentAction from "../utils/logRecentAction.js";
export const assignTaskToUser = async (taskId, userId, performedBy) => {
  const newUser = await UserModel.findById(userId);

  if (!newUser)
    return res
      .status(404)
      .json({ success: false, message: "New user not found" });

  const task = await TaskModel.findById(taskId);
  if (!task) {
    return res.status(404).json({ success: false, message: "Task not found" });
  }

  // if user is same then return 

    if (task.assignedTo && task?.assignedTo.toString() == userId) {
    return {
      success: false,
      message: `Task "${task.title}" is already assigned to this user.`,
      alreadyAssigned: true,
    }
  }

  //  Remove task from previous user's queue
  if (task.assignedTo) {
    const prevUser = await UserModel.findById(task.assignedTo);
    if (prevUser) {
      prevUser.assignedProjects = prevUser.assignedProjects.filter(
        (id) => id.toString() !== taskId
      );
      await prevUser.save();
    }
  }


  // Assign task to new user
  task.assignedTo = userId;
  await task.save();

  // Re-populate assignedTo before sending back
  const populatedTask = await TaskModel.findById(taskId).populate(
    "assignedTo",
    "name email"
  );
  // Add task to new user's assignedProject (if not already there)
  if (!newUser.assignedProjects.includes(taskId)) {
    newUser.assignedProjects.push(taskId);
    await newUser.save();
  }
  const logs = {
    actionType: "assign",
    taskId,
    performedBy,
    details: `Assigned task "${task.title}" to ${newUser.name}`,
  };
  await logAction({ ...logs });
  await logRecentAction({ ...logs });
  return populatedTask;
};
