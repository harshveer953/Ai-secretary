import cron from "node-cron";
import Appointment from "../modules/appointments/appointment.schema.js";

const startAppointmentCron = () => {
  cron.schedule("* * * * *", async () => {
    try {
      console.log("Checking appointments...");

      const now = new Date();

      const appointments = await Appointment.find({
        status: "scheduled",
      });

      for (const appointment of appointments) {
        const appointmentDateTime = new Date(appointment.appointmentDate);

        const [hours, minutes] = appointment.appointmentTime
          .split(":")
          .map(Number);

        appointmentDateTime.setHours(hours, minutes, 0, 0);

        if (appointmentDateTime <= now) {
          await Appointment.findByIdAndUpdate(
            appointment._id,
            { status: "missed" }
          );

          console.log(
            ` Marked Missed -> ${appointment.title}`
          );
        }
      }
    } catch (error) {
      console.error(error);
    }
  });
};

export default startAppointmentCron;