import ActionLogModel from "../models/ActionLogModel.js";
import TaskModel from "../models/TaskModel.js";

const logGroupedAction  = async ({
  actionType,
  taskId,
  performedBy,
  details,
  comment,
}) => {
  try {
    // Get the task title from the task ID
    const task = await TaskModel.findById(taskId);
    if (!task) {
      return;
    }

    // Define the new log object
    const newLog = {
      actionType,
      taskId,
      performedBy,
      details,
      comment,
    };

    // Find if log group already exists for this title
    const existingLogDoc = await ActionLogModel.findOne({ title: task.title });

    if (existingLogDoc) {
      // Push to existing logs array
      await ActionLogModel.updateOne(
        { title: task.title },
        { $push: { logs: newLog } }
      );
    } else {
      // Create new grouped log document
      await ActionLogModel.create({
        title: task.title,
        logs: [newLog],
      });
    }
  } catch (error) {
    return { success: false, message: error.message };

  }
};

export default logGroupedAction 