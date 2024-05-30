import express from "express";
import User from "../models/user.model.js";
import { jwtAuthMiddleware, generateToken } from "../auth/jwt.js";
const router = express.Router();

//post request to create a new person
router.post("/signup", async (req, res) => {
  // console.log(req.body);
  try {
    if (req.body.role === "admin") {
      const existingAdmin = await User.findOne({ role: "admin" });
      if (existingAdmin) {
        return res.status(400).send("Admin already exists");
      }
    }
    //create a new user
    const user = new User(req.body);
    //save the user
    const response = await user.save();
    console.log("User created successfully");

    const payload = {
      id: response._id,
    };
    //generate token
    const token = generateToken(payload);
    console.log("Token generated successfully : ", token);

    res.status(200).json({ response, token });
  } catch (error) {
    console.error("Error occurred during signup:", error);
    res.status(500).send(error);
  }
});

//login route
router.post("/login", async (req, res) => {
  try {
    const { aadharCardNumber, password } = req.query;
    // console.log(req.query);
    // console.log(
    //   "Login request received for aadharCardNumber: ",
    //   aadharCardNumber
    // );
    // console.log("Login request received for password: ", password);
    //check if the user exists
    const user = await User.findOne({ aadharCardNumber });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(404).send("Invalid aadhar Card Number or password");
    }
    //gen token
    const payload = {
      id: user._id,
    };
    const token = generateToken(payload);
    console.log("Token generated successfully : ", token);
    res.status(200).json({ user, token });
  } catch (error) {
    console.error("Error occurred during login:", error);
    res.status(500).send(error);
  }
});

//profile route
router.get("/profile", jwtAuthMiddleware, async (req, res) => {
  try {
    const userData = req.user;
    const user = await User.findById(userData.id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error occurred during profile:", error);
    res.status(500).send(error);
  }
});

//for updating a person
router.put("/profile/password", jwtAuthMiddleware, async (req, res) => {
  try {
    //find the person by id and update
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(userId);
    // if password is not correct then return invalid password message to the user
    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(404).send("Invalid user or password");
    }

    user.password = newPassword; //update the password
    const response = await user.save();

    console.log("Password updated successfully");
    res.status(200).json(response);
  } catch (error) {
    res.status(500).send(error);
  }
});

export default router;
