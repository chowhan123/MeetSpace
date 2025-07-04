import crypto from "crypto";
import { User } from "../models/userModel.js";
import { Meeting } from "../models/meetingModel.js";
import bcrypt, {hash} from "bcryptjs";
import httpStatus from "http-status";


// Register function to create a new user
export const register = async (req, res) => {
    const { name, username, password } = req.body;
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            name,
            username,
            password: hashedPassword,
        });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        res.status(500).json({ message: `Internal server error: ${error.message}` });
    }
};

// Login function to authenticate user
export const login = async (req, res) => {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    try {
        // Find user by username
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate token (replace this with JWT in production)
        const token = crypto.randomBytes(20).toString("hex");
        user.token = token;
        await user.save();

        res.status(200).json({ message: "Login successful", token });

    } catch (error) {
        res.status(500).json({ message: `Internal server error: ${error.message}` });
    }
};


// Add meeting to user history
export const getUserHistory = async (req, res) => {
    const { token } = req.query;
    if (!token) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Token is required" });
    }

    try {
        // Find the user using the token
        const user = await User.findOne({ token });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
        }

        // Use correct field (e.g., userId or username, depends on your schema)
        const meetings = await Meeting.find({ userId: user.username });
        return res.status(httpStatus.OK).json(meetings);

    } catch (error) {
        console.error("Error fetching user history:", error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: `Something went wrong: ${error.message}`
        });
    }
};


export const addToHistory = async (req, res) => {
  const { token, meeting_code } = req.body;

  // Validation
  if (!meeting_code || meeting_code.trim() === "") {
    return res.status(400).json({ message: "Meeting code is required." });
  }

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const newMeeting = new Meeting({
      userId: user.username,
      meetingCode: meeting_code,
    });

    await newMeeting.save();

    return res.status(201).json({
      message: "Meeting joined successfully.",
      meeting_id: newMeeting._id, // send meeting ID back
      code: meeting_code,
    });
  } catch (error) {
    console.error("Error adding to history:", error);
    return res.status(500).json({ message: error.message });
  }
};
