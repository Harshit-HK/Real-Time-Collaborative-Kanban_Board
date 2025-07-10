import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import UserModel from "../models/UserModel.js";

// --------------------- Register Controller ---------------------
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // checking if user already exist
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    // Validating email formate
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    // strong Password
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      phone,
    });
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --------------------- Login Controller ---------------------
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await UserModel.findOne({ email });
    if (!existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email doesn't exists"});
    }

    const isPasswordMatch = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Credentials" });
    }

    const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET);

    res.status(200).json({
      success: true,
      token,
      user: {
        name: existingUser.name,
        email: existingUser.email,
        phone: existingUser.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

// --------------------- Verifying user -----------------------
export const verifyUser = async (req, res) => {
  try {
    const existingUser = await UserModel.findById(req.userId).select(
      "-password"
    );
    if (!existingUser) {
      return res
        .status(401)
        .json({ success: false, message: "Not Authorized, Login Again" });
    }
    res.json({
      success: true,
      user: {
        name: existingUser.name,
        email: existingUser.email,
        phone: existingUser.phone,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Token verification failed" });
  }
};
