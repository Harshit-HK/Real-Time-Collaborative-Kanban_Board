// server/utils/logRecentAction.js
import RecentActionModel from "../models/RecentActionModel.js";

const logRecentAction = async ({
  actionType,
  taskId,
  performedBy,
  details = "",
  comment = "",
}) => {
  try {
    const newLog = await RecentActionModel.create({
      actionType,
      taskId,
      performedBy,
      details,
      comment,
    });
    // Emit socket event for real-time logs
    const io = global.ioInstance;
    if (io) {
      const populatedLog = await newLog.populate("performedBy", "name email");
      io.emit("recentLogUpdated", populatedLog);
    }
  } catch (error) {
return { success: false, message: error.message };
  }
};

export default logRecentAction;
