const { getDatabase, ref, get, update, push, set } = require('firebase/database');

// Function to get all pets for a user
exports.getPetsByUserId = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const db = getDatabase();
    const petRef = ref(db, `users/${userId}/pets`);
    const snapshot = await get(petRef);
    const pets = snapshot.val();

    if (pets) {
      const petList = Object.entries(pets).map(([key, value]) => ({
        ...value,
        key,
      }));
      res.status(200).json({ pets: petList });
    } else {
      res.status(200).json({ pets: [] });
    }
  } catch (error) {
    console.error("Error fetching pets:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.getPetDetails = async (req, res) => {
  const { userId, petId } = req.params;

  if (!userId || !petId) {
    return res.status(400).json({ error: 'User ID and Pet ID are required' });
  }

  try {
    const db = getDatabase();
    const petRef = ref(db, `users/${userId}/pets/${petId}`);
    const snapshot = await get(petRef);
    const pet = snapshot.val();

    if (pet) {
      res.status(200).json({ pet });
    } else {
      res.status(404).json({ error: 'Pet not found' });
    }
  } catch (error) {
    console.error("Error fetching pet details:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.getPetMedicalHistory = async (req, res) => {
  const { userId, petId } = req.params;

  if (!userId || !petId) {
    return res.status(400).json({ error: 'User ID and Pet ID are required' });
  }

  try {
    const db = getDatabase();
    const medicalHistoryRef = ref(db, `users/${userId}/pets/${petId}/medicalHistory`);
    const snapshot = await get(medicalHistoryRef);
    const medicalHistory = snapshot.val();

    if (medicalHistory) {
      res.status(200).json({ medicalHistory });
    } else {
      res.status(404).json({ error: 'Medical history not found' });
    }
  } catch (error) {
    console.error("Error fetching medical history:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updatePetDetails = async (req, res) => {
  const { userId, petId } = req.params;
  const updatedPetData = req.body;
  const db = getDatabase();

  try {
    const petRef = ref(db, `users/${userId}/pets/${petId}`);
    await update(petRef, updatedPetData);
    return res.status(200).json({ message: "Pet details updated successfully" });
  } catch (error) {
    console.error("Error updating pet details:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
exports.addPet = async (req, res) => {
  const { userId } = req.params;
  const { name, age, type, weight, imageUrl, dob } = req.body;
  const db = getDatabase();

  try {
    const newPetRef = push(ref(db, `users/${userId}/pets`));
    await set(newPetRef, { name, age, type, weight, imageUrl, dob });
    return res.status(200).json({ message: "Pet added successfully" });
  } catch (error) {
    console.error("Error adding pet:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

