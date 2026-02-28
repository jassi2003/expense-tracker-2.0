import cron from "node-cron";
import { rebuildAdminStats } from "../services/rebuidAdminStats.service.js";



export const adminStatsCron = cron.schedule("0 2 * * *", async () => {
  console.log(" Running scheduled admin stats rebuild...");
  try {
    await rebuildAdminStats();
    console.log(" Scheduled rebuild completed");
  } catch (err) {
    console.error(" Scheduled rebuild failed:", err);
  }
});


