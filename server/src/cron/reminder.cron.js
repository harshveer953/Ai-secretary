import cron from "node-cron";

import Reminder from "../modules/reminders/reminder.schema.js";
import { sendEmail } from "../utils/sendEmail.js";

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
        await sendEmail({
  to: reminder.appointment.contact.email,
  subject: "Appointment Reminder - AI Secretary",
  html: `
    <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; padding:20px; border:1px solid #ddd; border-radius:10px;">
      
      <h2 style="color:#2563eb;">
        📅 Appointment Reminder
      </h2>

      <p>
        Hello <strong>${reminder.appointment.contact.fullName}</strong>,
      </p>

      <p>
        This is a reminder for your upcoming appointment.
      </p>

      <table style="width:100%; border-collapse: collapse; margin:20px 0;">
        <tr>
          <td><strong>Title</strong></td>
          <td>${reminder.appointment.title}</td>
        </tr>

        <tr>
          <td><strong>Date</strong></td>
          <td>${new Date(
            reminder.appointment.appointmentDate
          ).toLocaleDateString()}</td>
        </tr>

        <tr>
          <td><strong>Time</strong></td>
          <td>${reminder.appointment.appointmentTime}</td>
        </tr>
      </table>

      <p>
        Please be available on time.
      </p>

      <hr>

      <p style="font-size:13px;color:gray;">
        AI Secretary
      </p>

    </div>
  `,
});

console.log(
  `Reminder email sent to ${reminder.appointment.contact.email}`
);

        reminder.sent = true;
        reminder.sentAt = new Date();

        await reminder.save();
      }
    } catch (error) {
      console.error("Reminder Cron Error:", error);
    }
  });
};