//CRON JOB THAT RUNS EVERY 1 HOUR TO UPDATE EXCHANGE RATES

import cron from "node-cron";
import axios from "axios";
import exchangeRateModel from "../models/exchangeRate.model.js";

const EXCHANGE_API = "https://open.er-api.com/v6/latest/INR";

export const updateExchangeRates = async () => {
  try {
    const res = await axios.get(EXCHANGE_API);

    if (res.data.result !== "success") {
      throw new Error("Exchange API failed");
    }

    await exchangeRateModel.findOneAndUpdate(
      { base: "INR" },
      {
        rates: res.data.rates,
        lastUpdated: new Date(),
      },
      { upsert: true }
    );
    console.log("Exchange rates updated");

  } catch (err) {
    console.error("Exchange update failed:", err.message);
  }
};

// export const startExchangeCron = () => {
//   // Every 1 hour
//   cron.schedule("0 * * * *", updateExchangeRates);
//     console.log("Exchange rate cron started");
// };

