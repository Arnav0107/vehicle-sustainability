import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import vehicleRoutes from "./routes/vehicle.routes.js";


dotenv.config();

const app = express();
app.use(express.json());


// ---- ROUTES ----
app.use("/api/vehicles", vehicleRoutes);



mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
