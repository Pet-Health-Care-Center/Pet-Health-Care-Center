
// server/controllers/userController.js
const {database, ref: dbRef, get, update, set } = require("../database/conn");
const { getStorage, ref: storageRef, uploadBytes, getDownloadURL } = require('firebase/storage');


const getUserById = async (req, res) => {
  const { userId } = req.params;
  try {
    const userRef = dbRef(database, `users/${userId}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      const userData = snapshot.val();
      res.status(200).json(userData);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateUserById = async (req, res) => {
  const userId = req.params.userId;
  const updates = req.body;
  try {
    console.log(`Updating user ${userId} with data`, updates);
    const userRef = dbRef(database, `users/${userId}`);
    await update(userRef, updates);
    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: 'Error updating user data', error });
  }
};

const uploadAvatar = async (req, res) => {
  const userId = req.params.userId;
  const file = req.file;
  try {
    const storage = getStorage();
    const storageReference = storageRef(storage, `avatars/${userId}/${file.originalname}`);
    
    // Set metadata for the file
    const metadata = {
      contentType: file.mimetype,
    };

    await uploadBytes(storageReference, file.buffer, metadata);
    const downloadURL = await getDownloadURL(storageReference);

    const userRef = dbRef(database, `users/${userId}`);
    await update(userRef, { avatar: downloadURL });

    res.status(200).json({ avatar: downloadURL });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    res.status(500).json({ message: 'Error uploading avatar', error });
  }
};
const getAllUsers = async (req, res) => {
  try {
    const userRef = dbRef(database, `users`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      const userData = snapshot.val();
      res.status(200).json(userData);
    } else {
      res.status(404).json({ error: "Users not found" });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



module.exports = { getUserById, updateUserById, uploadAvatar, getAllUsers };