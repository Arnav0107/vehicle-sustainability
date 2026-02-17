// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import Price from "./model/Price.model.js";

// dotenv.config();

// mongoose.connect(process.env.MONGO_URI)
//   .then(async () => {
//     console.log("MongoDB connected for seeding ✅");

//     await Price.insertMany([
//       { city: "Delhi", petrolPrice: 96.72, electricityPrice: 8 },
//       { city: "Mumbai", petrolPrice: 106.31, electricityPrice: 9 },
//       { city: "Chennai", petrolPrice: 102.63, electricityPrice: 7.5 },
//       { city: "Bangalore", petrolPrice: 101.94, electricityPrice: 8.2 }
//     ]);

//     console.log("Prices inserted ✅");
//     process.exit();
//   })
//   .catch(err => console.error(err));
