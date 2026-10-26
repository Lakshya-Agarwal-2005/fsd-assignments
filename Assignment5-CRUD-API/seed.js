// Fills the database with sample plants:  npm run seed
const mongoose = require("mongoose");
const Plant = require("./models/Plant");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/verdant";
const daysAgo = (n) => new Date(Date.now() - n * 864e5);

const plants = [
  { name: "Monty", species: "Monstera deliciosa", icon: "🌿", room: "Living room", light: "Bright indirect", waterEveryDays: 7, lastWatered: daysAgo(8), notes: "Wipe the leaves every Sunday." },
  { name: "Spike", species: "Snake plant", icon: "🌵", room: "Bedroom", light: "Low light", waterEveryDays: 14, lastWatered: daysAgo(3), notes: "Almost impossible to kill." },
  { name: "Basil Brush", species: "Sweet basil", icon: "🌱", room: "Kitchen", light: "Direct sun", waterEveryDays: 2, lastWatered: daysAgo(2), notes: "Pinch the flowers off." },
  { name: "Fernando", species: "Boston fern", icon: "🍃", room: "Bathroom", light: "Medium light", waterEveryDays: 3, lastWatered: daysAgo(1), notes: "Loves the shower steam." },
  { name: "Sunny", species: "Dwarf sunflower", icon: "🌻", room: "Balcony", light: "Direct sun", waterEveryDays: 2, lastWatered: daysAgo(4), notes: "" },
  { name: "Tulsi", species: "Holy basil", icon: "🪴", room: "Balcony", light: "Direct sun", waterEveryDays: 2, lastWatered: daysAgo(0), notes: "Grandma's cutting." },
  { name: "Bamboo Bob", species: "Lucky bamboo", icon: "🎋", room: "Study", light: "Low light", waterEveryDays: 10, lastWatered: daysAgo(5), notes: "Change the water, don't just top it up." },
  { name: "Rosie", species: "Miniature rose", icon: "🌸", room: "Study", light: "Bright indirect", waterEveryDays: 4, lastWatered: daysAgo(6), notes: "" },
];

(async () => {
  await mongoose.connect(MONGO_URI);
  await Plant.deleteMany({});
  const created = await Plant.insertMany(plants);
  console.log(`Seeded ${created.length} plants into the "${mongoose.connection.name}" database (collection: plants)`);
  await mongoose.disconnect();
})().catch((err) => {
  console.error("Seeding failed:", err.message);
  process.exit(1);
});
