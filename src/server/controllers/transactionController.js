const fetch = require('node-fetch');
const { getDatabase, ref, get, update, set, onValue, runTransaction } = require('firebase/database');

exports.getTransactions = async (req, res) => {
  try {
    const response = await fetch(process.env.REACT_APP_CASSO_API_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Apikey ${process.env.REACT_APP_CASSO_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const descriptions = result.data.records.map(record => record.description);
    const times = result.data.records.map(record => record.when);
    const amounts = result.data.records.map(record => record.amount);

    res.status(200).json({ descriptions, times, amounts });
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
};

exports.updateUserBooking = async (req, res) => {
  const { uid, bookingId, paymentAmountInSystem, totalPaid, selectedDateTime, selectedPet, selectedServices, username, userId } = req.body;
  const db = getDatabase();
  const userRef = ref(db, `users/${uid}`);

  try {
    const snapshot = await get(userRef);
    const data = snapshot.val();

    if (!data) {
      throw new Error('No user data found.');
    }

    const accountBalanceNumber = parseFloat(data.accountBalance);
    const newAccountBalance = accountBalanceNumber + paymentAmountInSystem - totalPaid;

    if (newAccountBalance >= 0) {
      await runTransaction(userRef, (currentUser) => {
        if (currentUser) {
          currentUser.accountBalance = newAccountBalance;
        }
        return currentUser;
      });

      const bookingRef = ref(db, `users/${uid}/bookings`);
      const bookingSnapshot = await get(bookingRef);
      const bookings = bookingSnapshot.val();
      if (bookings) {
        const bookingKey = Object.keys(bookings).find(
          (key) => bookings[key].bookingId === bookingId
        );
        if (bookingKey) {
          const specificBookingRef = ref(
            db,
            `users/${uid}/bookings/${bookingKey}`
          );
          await runTransaction(specificBookingRef, (currentBooking) => {
            if (currentBooking) {
              currentBooking.status = "Paid";
            }
            return currentBooking;
          });
        }
      }

      const bookingSlotRef = ref(
        db,
        `users/${selectedDateTime.vet.uid}/schedule/${selectedDateTime.date}`
      );
      const bookingSlotSnapshot = await get(bookingSlotRef);
      let bookedSlots = Array.isArray(bookingSlotSnapshot.val())
        ? bookingSlotSnapshot.val()
        : [];

      bookedSlots.push({
        time: selectedDateTime.time,
        petName: selectedPet.name,
        services: selectedServices.map((service) => service.name),
        userAccount: data.email,
        username: username,
        status: 1,
        bookingId: bookingId,
        userId: userId
      });

      await set(
        ref(
          db,
          `users/${selectedDateTime.vet.uid}/schedule/${selectedDateTime.date}`
        ),
        bookedSlots
      );

      res.status(200).json({ message: 'Booking and user balance updated successfully' });
    } else {
      throw new Error('Insufficient balance');
    }
  } catch (error) {
    console.error('Error updating user booking: ', error);
    res.status(500).json({ error: 'Failed to update user booking' });
  }
};
