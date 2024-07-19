const express = require("express");
const {
  getServices,
  getCages,
  getCageByKey,
  updateCageByKey,
  addNewService,
  addNewCage,
} = require("../controllers/service-cageController");
const router = express.Router();

router.get("/getServices", getServices);
router.get("/getCages", getCages);
router.get("/getCages/:key", getCageByKey);
router.post("/updateCage/:key", updateCageByKey);
router.post("/addNewService", addNewService);
router.post("/addNewCage", addNewCage);

module.exports = router;
