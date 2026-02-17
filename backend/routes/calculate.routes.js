import express from "express";
import Vehicle from "../model/Vehicle.model.js"; 
import CityEnergy from "../model/cityEnergy.model.js";
import { calculateVehicleImpact } from "../services/calculation.service.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    // 1. Get dailyKm from Postman body
    const { dailyKm, years, city } = req.body; 

    // 2. Convert daily km to annual km (30 * 365)
    const avgKmPerYear = Number(dailyKm) * 365;

    // 3. Find data in your Database
    const cityData = await CityEnergy.findOne({ city });
    const vehicles = await Vehicle.find();

    // 4. Run the calculation for every vehicle
    const results = vehicles.map((vehicle) => {
      const data = calculateVehicleImpact({
        avgKmPerYear, 
        years: Number(years),
        vehicle,
        cityData: cityData || { petrolPrice: 100, electricityPrice: 8 }, // Use defaults if city not found
      });

      return {
        name: `${vehicle.make} ${vehicle.model}`,
        category: vehicle.category,
        ...data, // This adds 'totalCost' and 'totalCarbon' to the object
      };
    });

    // 5. Send the final array back to Postman
    res.status(200).json(results);

  } catch (error) {
    console.error("Route Error:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;