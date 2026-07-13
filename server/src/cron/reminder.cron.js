import cron from "node-cron";

import Reminder from "../modules/reminders/reminder.schema.js";

export const startReminderCron = () => {
  cron.schedule("* * * * *", async () => {
    try {
      console.log("Checking reminders...");

      const reminders = await Reminder.find({
        sent: false,
        reminderTime: {
          $lte: new Date(),
        },
      })
        .populate({
          path: "appointment",
          populate: {
            path: "contact",
          },
        });

      console.log(`Found ${reminders.length} reminder(s)`);

      for (const reminder of reminders) {
        console.log("================================");
        console.log("Reminder Sent");
        console.log("To:", reminder.appointment.contact.email);
        console.log("Title:", reminder.appointment.title);
        console.log("Date:", reminder.appointment.appointmentDate);
        console.log("Time:", reminder.appointment.appointmentTime);
        console.log("================================");

        reminder.sent = true;
        reminder.sentAt = new Date();

        await reminder.save();
      }
    } catch (error) {
      console.error("Reminder Cron Error:", error);
    }
  });
};