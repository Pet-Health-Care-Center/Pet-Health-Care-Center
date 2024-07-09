const express = require("express");
const {
  getServices,
  getCages,
  addNewService,
  addNewCage,
} = require("../controllers/service-cageController");
const router = express.Router();

router.get("/getServices", getServices);
router.get("/getCages", getCages);
router.post("/addNewService", addNewService);
router.post("/addNewCage", addNewCage);

module.exports = router;
