// Get all vehicles
app.get("/api/vehicles", async (req, res) => {
  try {
    const { category, make, year } = req.query;
    let query = {};

    if (category) query.category = category;
    if (make) query.make = make;
    if (year) query.year = Number(year);

    const vehicles = await Vehicle.find(query);
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get a single vehicle by ID
app.get("/api/vehicles/:id", async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
