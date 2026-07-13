import config from "./config/env.js";
import app from "./app.js";
import connectDB from "./config/database.js";

import startAppointmentCron from "./jobs/appointment.job.js";
import { startReminderCron } from "./cron/reminder.cron.js";


const startServer = async () => {
  try {
    await connectDB();

    startReminderCron()

    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });

      // start Cron jobs
      startAppointmentCron()

  } catch (error) {
    console.error("Failed to start server");
    console.error(error);
    process.exit(1);
  }
};

startServer();