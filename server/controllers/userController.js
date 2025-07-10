import UserModel from "../models/UserModel.js";

// GET all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find({}, "name email");
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};
