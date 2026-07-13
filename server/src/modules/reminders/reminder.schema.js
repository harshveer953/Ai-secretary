import mongoose from "mongoose"

const reminderSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },

    reminderType: {
      type: String,
      enum: ["email", "whatsapp"],
      required: true,
    },

    reminderTime: {
      type: Date,
      required: true,
    },

    sent: {
      type: Boolean,
      default: false,
    },

    sentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Reminder = mongoose.model(
  "Reminder",
  reminderSchema
);

export default Reminder