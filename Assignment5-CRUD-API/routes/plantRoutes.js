const express = require("express");
const mongoose = require("mongoose");
const plants = require("../controllers/plantController");

const router = express.Router();

// Reject ids that are not valid MongoDB ObjectIds before they reach the database
router.param("id", (req, res, next, id) =>
  mongoose.isValidObjectId(id) ? next() : res.status(400).json({ message: "That is not a valid plant id" })
);

router.post("/", plants.createPlant); //       1. Create
router.get("/", plants.getPlants); //          2. Read all (with filters)
router.get("/:id", plants.getPlant); //           Read one
router.put("/:id", plants.updatePlant); //     3. Update
router.delete("/:id", plants.deletePlant); //  4. Delete

module.exports = router;
