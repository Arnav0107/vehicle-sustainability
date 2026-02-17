import express from "express";
import User from "../model/User.js";

const router = express.Router();

/* Save user data */
router.post("/create", async (req, res) => {
  try {
    const { dailyKm, years, city } = req.body;

    const user = new User({ dailyKm, years, city });
    await user.save();

    res.json({ message: "User data saved", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Get latest user */
router.get("/latest", async (req, res) => {
  const user = await User.findOne().sort({ _id: -1 });
  res.json(user);
});

export default router;
