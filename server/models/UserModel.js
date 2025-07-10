import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    assignedProjects: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true, minimize: false }
);

const userModel = mongoose.models.User || mongoose.model("User", userSchema);

export default userModel;
