const { getDatabase, ref, push, update, get, set, runTransaction } = require('firebase/database');

const addBooking = async (req, res) => {
  const { userId, newBooking } = req.body;

  if (!userId || !newBooking) {
    console.error('Missing required fields: userId or newBooking');
    return res.status(400).json({ error: 'User ID and booking details are required' });
  }

  try {
    const db = getDatabase();
    const bookingRef = ref(db, `users/${userId}/bookings`);
    await push(bookingRef, newBooking);
    if (!res.headersSent) {
      res.status(200).json({ message: 'Booking added successfully' });
    }
  } catch (error) {
    console.error("Error adding booking to database:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

const updateAccountBalance = async (req, res) => {
  const { userId, newBalance } = req.body;
  if (!userId || newBalance === undefined) {
    return res.status(400).json({ error: 'User ID and new balance are required' });
  }

  try {
    const userRef = ref(getDatabase(), `users/${userId}/accountBalance`);
    
    await runTransaction(userRef, (currentBalance) => {
      if (currentBalance === null) {
        return newBalance; // If currentBalance is null, set it to newBalance
      }
      return newBalance;
    });

    if (!res.headersSent) {
      res.status(200).json({ message: 'Account balance updated successfully' });
    }
  } catch (error) {
    console.error("Error updating account balance:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

const updateVetSchedule = async (req, res) => {
  const { vetId, date, slot } = req.body;
  if (!vetId || !date || !slot) {
    return res.status(400).json({ error: 'Veterinarian ID, date, and slot are required' });
  }

  try {
    const db = getDatabase();
    const bookingSlotRef = ref(db, `users/${vetId}/schedule/${date}`);
    const bookingSlotSnapshot = await get(bookingSlotRef);
    let bookedSlots = Array.isArray(bookingSlotSnapshot.val()) ? bookingSlotSnapshot.val() : [];
    
    bookedSlots.push(slot);
    await set(ref(db, `users/${vetId}/schedule/${date}`), bookedSlots);

    if (!res.headersSent) {
      res.status(200).json({ message: 'Schedule updated successfully' });
    }
  } catch (error) {
    console.error("Error updating schedule:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = { addBooking, updateAccountBalance, updateVetSchedule };
