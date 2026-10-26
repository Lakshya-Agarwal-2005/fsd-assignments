const mongoose = require("mongoose");
const Plant = require("../models/Plant");

// Fields a client is allowed to set (anything else in the body is ignored)
const FIELDS = ["name", "species", "icon", "room", "light", "waterEveryDays", "lastWatered", "notes"];
const pick = (body = {}) => Object.fromEntries(FIELDS.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]));

// Turn Mongoose validation errors into { field: message } so the form can show them
function sendError(res, err) {
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.fromEntries(
      Object.entries(err.errors).map(([field, e]) => [field, e.name === "CastError" ? `${field} has an invalid value` : e.message])
    );
    return res.status(400).json({ message: "Some fields need fixing", errors });
  }
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: `${err.path} has an invalid value`, errors: { [err.path]: `${err.path} has an invalid value` } });
  }
  console.error(err);
  res.status(500).json({ message: "Something went wrong on the server" });
}

// 1. CREATE: POST /api/plants
exports.createPlant = async (req, res) => {
  try {
    const plant = await Plant.create(pick(req.body));
    res.status(201).json(plant);
  } catch (err) {
    sendError(res, err);
  }
};

// 2. READ all: GET /api/plants?room=Kitchen&search=fern&sort=thirsty
exports.getPlants = async (req, res) => {
  try {
    const filter = {};
    if (req.query.room) filter.room = String(req.query.room);
    if (req.query.search) {
      const safe = String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // escape regex characters
      filter.$or = [{ name: new RegExp(safe, "i") }, { species: new RegExp(safe, "i") }];
    }
    const sort = { name: { name: 1 } }[req.query.sort] || { createdAt: -1 };

    let plants = await Plant.find(filter).sort(sort);
    if (req.query.sort === "thirsty") plants = plants.sort((a, b) => a.daysUntilWater - b.daysUntilWater);
    res.json(plants);
  } catch (err) {
    sendError(res, err);
  }
};

//    READ one: GET /api/plants/:id
exports.getPlant = async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (!plant) return res.status(404).json({ message: "Plant not found" });
    res.json(plant);
  } catch (err) {
    sendError(res, err);
  }
};

// 3. UPDATE: PUT /api/plants/:id  (the "Water now" button also uses this)
exports.updatePlant = async (req, res) => {
  try {
    const plant = await Plant.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true });
    if (!plant) return res.status(404).json({ message: "Plant not found" });
    res.json(plant);
  } catch (err) {
    sendError(res, err);
  }
};

// 4. DELETE: DELETE /api/plants/:id
exports.deletePlant = async (req, res) => {
  try {
    const plant = await Plant.findByIdAndDelete(req.params.id);
    if (!plant) return res.status(404).json({ message: "Plant not found" });
    res.json({ message: `${plant.name} was removed`, plant });
  } catch (err) {
    sendError(res, err);
  }
};
