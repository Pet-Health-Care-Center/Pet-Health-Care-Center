const express = require('express');
const {
    getPetsByUserId,
    getPetDetails,
    getPetMedicalHistory,
    updatePetDetails,
    addPet
  } = require('../controllers/petController');
const router = express.Router();

router.get('/:userId', getPetsByUserId);
router.get('/:userId/:petId', getPetDetails);
router.get('/:userId/:petId/medicalHistory', getPetMedicalHistory);
router.put("/:userId/:petId", updatePetDetails);
router.post("/:userId/addPet", addPet);

module.exports = router;