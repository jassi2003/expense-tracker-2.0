import exchangeRateModel from "../models/exchangeRate.model.js";


export const  getCurrencyList = async (req, res) => {
  const ratesDoc = await exchangeRateModel.findOne({ base: "INR" });

  if (!ratesDoc) {
    return res.status(500).json({ message: "Rates unavailable" });
  }

  const currencies = Object.keys(Object.fromEntries(ratesDoc.rates));

  res.json({ currencies });
};