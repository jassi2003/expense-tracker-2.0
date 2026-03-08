import cron from "node-cron";
import { updateExchangeRates } from "../services/exchangeRate.service.js";

//EXCHANGE RATE CRON 
export const exchangeRateCron = cron.schedule("0 * * * *", async () => {
  console.log(" Running scheduled exchange rate update...");
  try {
    await updateExchangeRates();
    console.log(" Scheduled exchange rate update completed");
  } catch (err) {
    console.error(" Scheduled exchange rate update failed:", err);
  } 
});




