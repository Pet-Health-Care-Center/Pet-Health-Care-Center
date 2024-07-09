const {
  database,
  ref: dbRef,
  get,
  update,
  set,
  push,
} = require("../database/conn");


const getServices = async (req, res) => {
  try {
    const serviceRef = dbRef(database, `services`);
    const snapshot = await get(serviceRef);
    if (snapshot.exists()) {
      const serviceData = snapshot.val();
      res.status(200).json(serviceData);
    }
  } catch (error) {
    console.error("Error get service:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getCages = async (req, res) => {
  try {
    const cageRef = dbRef(database, `cages`);
    const snapshot = await get(cageRef);
    if (snapshot.exists()) {
      const cageData = snapshot.val();
      res.status(200).json(cageData);
    }
  } catch (error) {
    console.error("Error get cages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const addNewService = async (req, res) => {
  const serviceData = req.body;
  try {
    console.log(`Adding new service`, serviceData);
    const serviceRef = dbRef(database, `services`);
    await update(serviceRef, serviceData);
    res.status(200).json({ message: "New service added successfully" });
  } catch (error) {
    console.error("Error add new service:", error);
    res.status(500).json({ message: "Error service added data", error });
  }
};
const addNewCage = async (req, res) => {
  const cageData = req.body;
  try {
    console.log(`Adding new cage`, cageData);
    const cageRef = push(dbRef(database, `cages`));
    await update(cageRef, cageData);
    res.status(200).json({ message: "New cage added successfully" });
  } catch (error) {
    console.error("Error add new cage:", error);
    res.status(500).json({ message: "Error cage added data", error });
  }
};

module.exports = {
  getServices,
  getCages,
  addNewService,
  addNewCage,
};
