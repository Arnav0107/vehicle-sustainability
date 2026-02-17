import express from "express";
import Vehicle from "../model/Vehicle.model.js";
import Price from "../model/price.model.js";
import { calculateVehicleImpact } from "../services/calculation.service.js";

const router = express.Router();

/*
POST /api/recommendation/suggest
Body:
{
  city: "Delhi",
  avgKmPerYear: 12000,
  years: 5,
  fuelType: "electric"
}
*/

router.post("/suggest", async (req, res) => {
  try {
    const { city, avgKmPerYear, years, fuelType } = req.body;

    if (!city || !avgKmPerYear || !years || !fuelType) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const cityData = await Price.findOne({ city });
    if (!cityData) {
      return res.status(404).json({ error: "City not found" });
    }

    // Get only selected category vehicles
    const vehicles = await Vehicle.find({
      category: fuelType.toLowerCase(),
    });

    if (!vehicles.length) {
      return res.status(404).json({
        error: "No vehicles found for selected category",
      });
    }

    let bestVehicle = null;
    let lowestCarbon = Infinity;

    for (const vehicle of vehicles) {
      const impact = calculateVehicleImpact({
        avgKmPerYear,
        years,
        vehicle,
        cityData,
      });

      if (impact.totalCarbon < lowestCarbon) {
        lowestCarbon = impact.totalCarbon;
        bestVehicle = {
          name: vehicle.make + " " + vehicle.model,
          category: vehicle.category,
          totalCarbon: impact.totalCarbon,
          totalCost: impact.totalCost,
        };
      }
    }

    res.json({
      message: "Best sustainable option found ✅",
      bestVehicle,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
