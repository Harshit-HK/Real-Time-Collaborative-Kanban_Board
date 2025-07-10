import mongoose from "mongoose";

const recentActionSchema = new mongoose.Schema(
  {
    actionType: {
      type: String,
      enum: [
        "create",
        "update",
        "delete",
        "assign",
        "Smart Assign",
        "Drag & Drop",
      ],
      required: true,
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
  { timestamps: true }
);

const RecentActionModel =
  mongoose.models.RecentAction ||
  mongoose.model("RecentAction", recentActionSchema);

export default RecentActionModel;
