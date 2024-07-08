// controllers/bookingsController.js
const { getDatabase, ref, get } = require("firebase/database");

// Function to convert status to number for sorting
const statusToNumber = (status) => {
  switch (status) {
    case "Paid":
      return 1;
    case "Checked-in":
      return 2;
    case "Rated":
      return 3;
    case "Cancelled":
      return 4;
    default:
      return 5;
  }
};

exports.getBookingsByUserId = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const db = getDatabase();
    const bookingRef = ref(db, `users/${userId}/bookings`);
    const snapshot = await get(bookingRef);
    const data = snapshot.val();

    if (data) {
      const paid = [];
      const unpaid = [];
      Object.keys(data).forEach((key) => {
        const booking = { ...data[key], key };
        if (
          booking.status === "Paid" ||
          booking.status === "Cancelled" ||
          booking.status === "Rated" ||
          booking.status === "Checked-in"
        ) {
          paid.push(booking);
        } else if (booking.status === "Pending Payment") {
          unpaid.push(booking);
        }
      });

      const compareBookings = (a, b) => {
        const statusDifference =
          statusToNumber(a.status) - statusToNumber(b.status);
        if (statusDifference !== 0) return statusDifference;

        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateA - dateB;
      };

      paid.sort(compareBookings);
      unpaid.sort(compareBookings);

      res.status(200).json({ paidBookings: paid, unpaidBookings: unpaid });
    } else {
      res.status(200).json({ paidBookings: [], unpaidBookings: [] });
    }
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getBookingDetails = async (req, res) => {
  const { userId, bookingId } = req.params;
  const db = getDatabase();

  try {
    const bookingSnapshot = await get(
      ref(db, `users/${userId}/bookings/${bookingId}`)
    );
    const medicalRecordSnapshot = await get(
      ref(db, `users/${userId}/bookings/${bookingId}/medicalRecord`)
    );

    if (!bookingSnapshot.exists()) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const bookingData = bookingSnapshot.val();
    const medicalRecordData = medicalRecordSnapshot.exists()
      ? medicalRecordSnapshot.val()
      : null;

    return res
      .status(200)
      .json({ booking: bookingData, medicalRecord: medicalRecordData });
  } catch (error) {
    console.error("Error fetching booking details:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.getServices = async (req, res) => {
  try {
    const db = getDatabase();
    const servicesRef = ref(db, 'services');
    const snapshot = await get(servicesRef);
    const services = snapshot.val();

    if (services) {
      const servicesArray = Object.keys(services).map(key => ({
        ...services[key],
        id: key
      }));
      res.status(200).json({ services: servicesArray });
    } else {
      res.status(200).json({ services: [] });
    }
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
exports.fetchAllBookingsUser = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const db = getDatabase();
    const bookingRef = ref(db, `users/${userId}/bookings`);
    const snapshot = await get(bookingRef);
    const data = snapshot.val();

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching data: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};