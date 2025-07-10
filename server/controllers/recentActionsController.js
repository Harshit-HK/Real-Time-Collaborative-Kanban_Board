import RecentActionModel from "../models/RecentActionModel.js";

export const getRecentActions = async (req, res) => {
  try {
    const allLogs = await RecentActionModel.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("performedBy", "name email")
      .populate("taskId", "title");


    res.status(200).json({ success: true, allLogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
