import mongoose from "mongoose"

const callSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    contact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contact",
      required: true,
    },

    callType: {
      type: String,
      enum: ["incoming", "outgoing"],
      required: true,
    },

    status: {
      type: String,
      enum: ["answered", "missed", "rejected"],
      default: "answered",
    },

    duration: {
      type: Number,
      default: 0,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    startedAt: {
      type: Date,
      required: true,
    },

    endedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Call = mongoose.model("Call", callSchema);

export default Call;