import fs from "fs";
import csv from "csv-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import Vehicle from "./model/Vehicle.model.js";
import PetrolVehicle from "./model/petrolVehicel.model.js";
import ElectricVehicle from "./model/electric.vehicle.model.js";
import HybridVehicle from "./model/hybrid.vehicle.model.js";

dotenv.config();

// ---------------- PATH FIX FOR ES MODULE ----------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const csvPath = path.join(__dirname, "vehicles.csv");

// ---------------- MAIN FUNCTION ----------------
async function importData() {
  try {
    // ✅ CONNECT TO MONGODB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected ✅");

    // ✅ DELETE OLD DATA
    await Vehicle.deleteMany({});
    console.log("Old vehicles deleted 🗑️");

    const vehicles = [];

    console.log("Reading CSV file... 📂");

    fs.createReadStream(csvPath)
      .on("error", (err) => {
        console.error("❌ CSV File Error:", err);
        process.exit(1);
      })

      .pipe(csv())

      .on("data", (row) => {

        const year = Number(row.year);
        if (!year || year < 2018) return;

        const fuel1 = row.fuelType1 || "";
        const fuel2 = row.fuelType2 || "";

        const isElectric = fuel1.includes("Electric");
        const isHybrid =
          fuel2 && fuel2 !== "" && !isElectric;

        // ---------------- ELECTRIC ----------------
        if (isElectric) {

          if (!row.combE || Number(row.combE) === 0) return;

          vehicles.push({
            category: "electric",
            data: {
              make: row.make,
              model: row.model,
              year,
              manufacturingEmission: 9000,
              batteryDisposalEmission: 3000,
              chargeConsumption: Number(row.combE)
            }
          });
        }

        // ---------------- HYBRID ----------------
        else if (isHybrid) {

          if (!row.comb08 || !row.co2TailpipeGpm) return;

          vehicles.push({
            category: "hybrid",
            data: {
              make: row.make,
              model: row.model,
              year,
              manufacturingEmission: 9000,
              combinedMPG: Number(row.comb08),
              co2TailpipeGpm: Number(row.co2TailpipeGpm),
              chargeConsumption: Number(row.combE) || 0
            }
          });
        }

        // ---------------- PETROL ----------------
        else {

          if (!row.comb08 || !row.co2TailpipeGpm) return;

          vehicles.push({
            category: "petrol",
            data: {
              make: row.make,
              model: row.model,
              year,
              manufacturingEmission: 9000,
              combinedMPG: Number(row.comb08),
              co2TailpipeGpm: Number(row.co2TailpipeGpm)
            }
          });
        }
      })

      .on("end", async () => {

        console.log("Importing vehicles... 🚀");

        for (const v of vehicles) {

          if (v.category === "electric") {
            await ElectricVehicle.create(v.data);
          }

          else if (v.category === "hybrid") {
            await HybridVehicle.create(v.data);
          }

          else {
            await PetrolVehicle.create(v.data);
          }
        }

        console.log("Vehicles Imported Successfully ✅");
        console.log(`Total Imported: ${vehicles.length}`);

        process.exit();
      });

  } catch (error) {
    console.error("❌ Import Error:", error);
    process.exit(1);
  }
}

importData();
