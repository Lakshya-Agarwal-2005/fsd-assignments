const mongoose = require("mongoose");

const ROOMS = ["Living room", "Bedroom", "Kitchen", "Balcony", "Study", "Bathroom"];
const LIGHT = ["Low light", "Medium light", "Bright indirect", "Direct sun"];
const ICONS = ["🪴", "🌿", "🌵", "🌱", "🍃", "🌸", "🌻", "🎋"];

const plantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Give your plant a name"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [40, "Name must be 40 characters or fewer"],
    },
    species: { type: String, trim: true, maxlength: [60, "Species must be 60 characters or fewer"], default: "" },
    icon: { type: String, enum: ICONS, default: "🪴" },
    room: { type: String, required: [true, "Pick a room"], enum: { values: ROOMS, message: "Pick one of the listed rooms" } },
    light: { type: String, required: [true, "Pick a light level"], enum: { values: LIGHT, message: "Pick one of the listed light levels" } },
    waterEveryDays: {
      type: Number,
      required: [true, "How often does it need water?"],
      min: [1, "Watering interval must be at least 1 day"],
      max: [60, "Watering interval must be 60 days or less"],
    },
    lastWatered: { type: Date, default: Date.now },
    notes: { type: String, trim: true, maxlength: [200, "Notes must be 200 characters or fewer"], default: "" },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

// Calculated fields (not stored in MongoDB): when the plant needs water next
plantSchema.virtual("nextWatering").get(function () {
  return new Date(this.lastWatered.getTime() + this.waterEveryDays * 864e5);
});

plantSchema.virtual("daysUntilWater").get(function () {
  const startOfToday = new Date().setHours(0, 0, 0, 0);
  const due = new Date(this.nextWatering).setHours(0, 0, 0, 0);
  return Math.round((due - startOfToday) / 864e5);
});

module.exports = mongoose.model("Plant", plantSchema);
module.exports.ROOMS = ROOMS;
module.exports.LIGHT = LIGHT;
module.exports.ICONS = ICONS;
