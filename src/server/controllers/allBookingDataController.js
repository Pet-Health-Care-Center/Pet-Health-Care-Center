const {
  getDatabase,
  ref,
  get,
  onValue,
  set,
  update,
} = require("firebase/database");

exports.getServices = async (req, res) => {
  try {
    const db = getDatabase();
    const servicesRef = ref(db, "services");

    onValue(servicesRef, (snapshot) => {
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
    }, (error) => {
      console.error("Error fetching services:", error);
      res.status(500).json({ error: "Internal server error" });
    });
  } catch (error) {
    console.error("Error initializing services fetch:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getVets = async (req, res) => {
  try {
    const db = getDatabase();
    const vetsRef = ref(db, "users");

    onValue(vetsRef, (snapshot) => {
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
    }, (error) => {
      console.error("Error fetching veterinarians:", error);
      res.status(500).json({ error: "Internal server error" });
    });
  } catch (error) {
    console.error("Error initializing veterinarians fetch:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const db = getDatabase();
    const usersRef = ref(db, "users");

    onValue(usersRef, (snapshot) => {
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
    }, (error) => {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ error: "Internal server error" });
    });
  } catch (error) {
    console.error("Error initializing bookings fetch:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateCageHistory = async (req, res) => {
  const { bookingId } = req.params;
  const { cageHistory } = req.body;

  try {
    const db = getDatabase();
    const usersRef = ref(db, "users");

    onValue(usersRef, (snapshot) => {
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
    }, (error) => {
      console.error("Error fetching users data:", error);
      res.status(500).json({ error: "Internal server error" });
    });
  } catch (error) {
    console.error("Error updating cage history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

