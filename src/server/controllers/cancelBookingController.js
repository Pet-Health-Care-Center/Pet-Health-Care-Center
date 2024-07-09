const { getDatabase, ref, get, update, set, runTransaction } = require('firebase/database');

const cancelBooking = async (req, res) => {
  const { bookingKey, userId, vetId, date, time, totalPaid } = req.body;

  try {
    const db = getDatabase();
    const bookingRef = ref(db, `users/${userId}/bookings/${bookingKey}`);
    const vetScheduleRef = ref(db, `users/${vetId}/schedule/${date}`);
    const userRef = ref(db, `users/${userId}`);

    // Sử dụng giao dịch để đảm bảo cập nhật nguyên tử
    await runTransaction(bookingRef, (currentBooking) => {
      if (currentBooking) {
        currentBooking.status = "Cancelled";
        currentBooking.feeOfCancellation = totalPaid * 0.25;
      }
      return currentBooking;
    });

    await runTransaction(userRef, (currentUser) => {
      if (currentUser) {
        currentUser.accountBalance += totalPaid * 0.75;
      }
      return currentUser;
    });

    const vetScheduleSnapshot = await get(vetScheduleRef);
    const vetSchedule = vetScheduleSnapshot.val();

    const updatedSchedule = vetSchedule.map((slot) => {
      if (slot.time === time && slot.status === 1) {
        return { ...slot, status: 0 };
      }
      return slot;
    });

    await set(vetScheduleRef, updatedSchedule);

    res.status(200).json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  cancelBooking,
};
