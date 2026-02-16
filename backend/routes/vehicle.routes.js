import express from "express";
import Vehicle from "../model/Vehicle.model.js";

const router = express.Router();

router.post("/add", async (req, res) => {
  try {
    const vehicle = new Vehicle(req.body);
    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;


