const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const plantRoutes = require("./routes/plantRoutes");

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/verdant";

const app = express();

app.use(express.json({ limit: "10kb" })); // parse JSON request bodies
app.use(express.static(path.join(__dirname, "public"))); // the Verdant website

app.use("/api/plants", plantRoutes);

// Unknown API route
app.use("/api", (req, res) => res.status(404).json({ message: `No API route for ${req.method} ${req.originalUrl}` }));

// Malformed JSON body and other unexpected errors
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") return res.status(400).json({ message: "Request body is not valid JSON" });
  console.error(err);
  res.status(500).json({ message: "Something went wrong on the server" });
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(`Connected to MongoDB at ${MONGO_URI}`);
    app.listen(PORT, () => console.log(`Verdant is running at http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("Could not connect to MongoDB:", err.message);
    console.error("Start the MongoDB service, or set MONGO_URI in a .env file.");
    process.exit(1);
  });
