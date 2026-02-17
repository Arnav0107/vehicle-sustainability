import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

import { calculateVehicleImpact } from "./services/calculation.service.js";

// ❌ NOT NEEDED NOW (CSV already imported)
// import fs from "fs";
// import csv from "csv-parser";
// import path from "path";

// ❌ NOT NEEDED (scraping blocked)
// import axios from "axios";
// import * as cheerio from "cheerio";

import Vehicle from "./model/Vehicle.model.js";
import User from "./model/user.model.js";
import Price from "./model/price.model.js";

dotenv.config();

const app = express();
app.use(express.json());


// =====================================================
// MongoDB Connection
// =====================================================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.error("MongoDB connection error:", err));


// =====================================================
// ❌ CSV Import Function (RUN ONCE ONLY — NOW DISABLED)
// =====================================================
/*
async function importVehicles() {
  const vehicles = [];
  const filePath = path.join(process.cwd(), "vehicles.csv");

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
      const year = Number(row.year);
      if (year < 2020) return;

      let category = "";

      if (row.fuelType1?.includes("Electric")) {
        category = "electric";
      } else if (row.fuelType2 && row.fuelType2 !== "") {
        category = "hybrid";
      } else {
        category = "petrol";
      }

      vehicles.push({
        make: row.make,
        model: row.model,
        year,
        fuelType: row.fuelType1,
        category,
        cityMPG: Number(row.city08),
        highwayMPG: Number(row.highway08),
        combinedMPG: Number(row.comb08),
        co2TailpipeGpm: Number(row.co2TailpipeGpm),
        electricRange: Number(row.rangeA) || 0,
        chargeConsumption: Number(row.charge120) || 0,
        manufacturingEmission:
          category === "electric" ? 12000 : 9000,
        batteryDisposalEmission:
          category === "electric" ? 2000 : 0,
      });
    })
    .on("end", async () => {
      await Vehicle.deleteMany({});
      await Vehicle.insertMany(vehicles);
      console.log("✅ Vehicle data imported:", vehicles.length);
    });
}

// importVehicles(); ❌ DO NOT RUN AGAIN
*/


// =====================================================
// USER ROUTES
// =====================================================
app.post("/api/user", async (req, res) => {
  try {
    const { dailyKm, years, city } = req.body;

    if (!dailyKm || !years || !city) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const user = new User({ dailyKm, years, city });
    await user.save();

    res.json({ message: "User saved ✅", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/user/latest", async (req, res) => {
  try {
    const user = await User.findOne().sort({ _id: -1 });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =====================================================
// FUEL PRICE ROUTE
// =====================================================
app.get("/api/prices", async (req, res) => {
  try {
    const { city } = req.query;

    const price = await Price.findOne({ city });
    if (!price) {
      return res.status(404).json({ error: "City not found" });
    }

    res.json(price);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =====================================================
// VEHICLE ROUTES
// =====================================================
app.get("/api/vehicles", async (req, res) => {
  try {
    const vehicles = await Vehicle.find(req.query);
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =====================================================
// SINGLE VEHICLE CALCULATION
// =====================================================
app.post("/api/calculate", async (req, res) => {
  try {
    const { vehicleId, avgKmPerYear, years, city } = req.body;

    if (!vehicleId || !avgKmPerYear || !years || !city) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle)
      return res.status(404).json({ error: "Vehicle not found" });

    const cityData = await Price.findOne({ city });
    if (!cityData)
      return res.status(404).json({ error: "City not found" });

    cityData.gridEmissionFactor =
      cityData.gridEmissionFactor || 0.7;

    const result = calculateVehicleImpact({
      avgKmPerYear,
      years,
      vehicle,
      cityData,
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =====================================================
// CATEGORY COMPARISON (GRAPH DATA)
// =====================================================
app.post("/api/compare", async (req, res) => {
  try {
    const { city, dailyKm, years, category } = req.body;

    if (!city || !dailyKm || !years) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const avgKmPerYear = Number(dailyKm) * 365;

    const cityData = await Price.findOne({ city });
    if (!cityData) {
      return res.status(404).json({ error: "City not found" });
    }

    // ✅ Filter directly in DB
    const query = {};
    if (category) {
      query.category = category.toLowerCase();
    }

    const vehicles = await Vehicle.find(query);

    const results = vehicles.map((vehicle) => {
      const impact = calculateVehicleImpact({
        avgKmPerYear,
        years,
        vehicle,
        cityData,
      });

      return {
        name: `${vehicle.make} ${vehicle.model}`,
        category: vehicle.category,
        totalCost: impact.totalCost,
        totalCarbon: impact.totalCarbon,
      };
    });

    // Sort by lowest carbon
    results.sort((a, b) => a.totalCarbon - b.totalCarbon);

    res.json(results.slice(0, 20));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =====================================================
// BEST VEHICLE SUGGESTION (AFTER USER CHOOSES CATEGORY)
// =====================================================
app.post("/api/suggest", async (req, res) => {
  try {
    const { city, avgKmPerYear, years, category } = req.body;

    if (!city || !avgKmPerYear || !years || !category) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const cityData = await Price.findOne({ city });
    if (!cityData) {
      return res.status(404).json({ error: "City not found" });
    }

    const vehicles = await Vehicle.find({
      category: category.toLowerCase(),
    });

    if (!vehicles.length) {
      return res.status(404).json({
        error: "No vehicles found for this category",
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


// =====================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT} 🚀`)
);
