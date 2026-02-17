export function calculateVehicleImpact({
  vehicle,
  dailyKm,
  years,
  petrolPrice,
  electricityPrice,
  cityCarbonIntensity
}) {

  const totalKm = dailyKm * 365 * years;

  let totalCost = 0;
  let totalEmission = 0;

  // ---------------- PETROL ----------------
  if (vehicle.type === "petrol") {

    const kmPerLitre = vehicle.combinedMPG * 0.425; // MPG → km/l
    const litresUsed = totalKm / kmPerLitre;

    totalCost = litresUsed * petrolPrice;

    const co2PerKm = vehicle.co2TailpipeGpm / 1.609; // g/mile → g/km
    const tailpipeEmission = co2PerKm * totalKm;

    totalEmission =
      tailpipeEmission + (vehicle.manufacturingEmission * 1000);
  }

  // ---------------- ELECTRIC ----------------
  else if (vehicle.type === "electric") {

    const kWhPerKm =
      (vehicle.chargeConsumption / 1000) / 1.609; // Wh/mile → kWh/km

    const totalElectricity = totalKm * kWhPerKm;

    totalCost = totalElectricity * electricityPrice;

    const electricEmission =
      totalElectricity * cityCarbonIntensity;

    totalEmission =
      electricEmission
      + (vehicle.manufacturingEmission * 1000)
      + (vehicle.batteryDisposalEmission * 1000);
  }

  // ---------------- HYBRID ----------------
  else if (vehicle.type === "hybrid") {

    // Petrol Portion
    const kmPerLitre = vehicle.combinedMPG * 0.425;
    const litresUsed = totalKm / kmPerLitre;
    const petrolCost = litresUsed * petrolPrice;

    const co2PerKm = vehicle.co2TailpipeGpm / 1.609;
    const petrolEmission = co2PerKm * totalKm;

    // Electric Portion (if exists)
    let electricCost = 0;
    let electricEmission = 0;

    if (vehicle.chargeConsumption > 0) {

      const kWhPerKm =
        (vehicle.chargeConsumption / 1000) / 1.609;

      const totalElectricity = totalKm * kWhPerKm;

      electricCost = totalElectricity * electricityPrice;
      electricEmission =
        totalElectricity * cityCarbonIntensity;
    }

    // 50-50 Split Model
    totalCost =
      (petrolCost / 2) + (electricCost / 2);

    totalEmission =
      (petrolEmission / 2)
      + (electricEmission / 2)
      + (vehicle.manufacturingEmission * 1000);
  }

  return {
    totalCost: Math.round(totalCost),
    totalEmissionKg: Math.round(totalEmission / 1000)
  };
}
