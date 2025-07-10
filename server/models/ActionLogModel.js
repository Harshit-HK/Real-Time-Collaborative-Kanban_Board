import mongoose from "mongoose";

const logEntrySchema = new mongoose.Schema(
  {
    actionType: {
      type: String,
      required: true,
      enum: [
        "create",
        "update",
        "delete",
        "assign",
        "Smart Assign",
        "Drag & Drop",
      ],
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    details: {
      type: String,
      default: "",
    },
    comment: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const actionLogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    logs: {
      // array of all actions on this task
      type: [logEntrySchema],
      default: [],
    },
  },

  { timestamps: true, minimize: false }
);

const ActionLogModel =
  mongoose.models.ActionLog || mongoose.model("ActionLog", actionLogSchema);

export default ActionLogModel;
