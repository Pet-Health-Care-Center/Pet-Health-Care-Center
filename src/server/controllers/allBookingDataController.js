const { getDatabase, ref, get, update } = require("firebase/database");

exports.getServices = async (req, res) => {
  try {
    const db = getDatabase();
    const servicesRef = ref(db, "services");

    const snapshot = await get(servicesRef);
    const services = snapshot.val();
    if (services) {
      const servicesArray = Object.keys(services).map((key) => ({
        ...services[key],
        id: key,
      }));
      res.status(200).json({ services: servicesArray });
    } else {
      res.status(200).json({ services: [] });
    }
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const db = getDatabase();
    const usersRef = ref(db, "users");

    const snapshot = await get(usersRef);
    const usersData = snapshot.val();
    let allBookings = [];

    if (usersData) {
      Object.keys(usersData).forEach((userId) => {
        const userData = usersData[userId];
        if (userData.bookings) {
          Object.keys(userData.bookings).forEach((bookingId) => {
            const booking = userData.bookings[bookingId];
            allBookings.push({
              userId,
              bookingId,
              ...booking,
            });
          });
        }
      });
    }

    res.status(200).json({ bookings: allBookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateCageHistory = async (req, res) => {
  const { bookingId } = req.params;
  const { cageHistory } = req.body;

  try {
    const db = getDatabase();
    const usersRef = ref(db, "users");

    const snapshot = await get(usersRef);
    const usersData = snapshot.val();
    let allBookings = [];

    if (usersData) {
      Object.keys(usersData).forEach((userId) => {
        const userData = usersData[userId];
        if (userData.bookings) {
          Object.keys(userData.bookings).forEach((key) => {
            const booking = userData.bookings[key];

            if (booking.bookingId === bookingId) {
              booking.cageHistory = cageHistory;

              const bookingRef = ref(db, `users/${userId}/bookings/${key}`);
              update(bookingRef, { cageHistory });

              allBookings.push({
                userId,
                bookingId: booking.bookingId,
                ...booking,
              });
            }
          });
        }
      });
    }

    res.status(200).json({ allBookings });
  } catch (error) {
    console.error("Error updating cage history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getVets = async (req, res) => {
  try {
    const db = getDatabase();
    const vetsRef = ref(db, "users");

    const snapshot = await get(vetsRef);
    const vetsData = snapshot.val();

    if (vetsData) {
const vetsList = Object.keys(vetsData)
        .filter((uid) => vetsData[uid].role === "veterinarian")
        .map((uid) => ({
          uid,
          name: vetsData[uid].fullname,
          schedule: vetsData[uid].schedule || {},
          specialization: vetsData[uid].specialization,
        }));
      res.status(200).json({ vets: vetsList });
    } else {
      res.status(200).json({ vets: [] });
    }
  } catch (error) {
    console.error("Error fetching veterinarians:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};