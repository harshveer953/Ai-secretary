import config from "./config/env.js";
import app from "./app.js";
import connectDB from "./config/database.js";

import startAppointmentCron from "./jobs/appointment.job.js";
import { startReminderCron } from "./cron/reminder.cron.js";

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(config.port, () => {
      console.log(
        `Server is running on port ${config.port}`
      );
    });

    // Start Cron Jobs
    startAppointmentCron();
    startReminderCron();

  } catch (error) {
    console.error(
      "Failed to start server:",
      error
    );

    process.exit(1);
  }
};

startServer();