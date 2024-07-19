const BASE_URL = "http://localhost:5000";

export const addBooking = async (userId, newBooking) => {
  console.log("Sending addBooking request with:", { userId, newBooking });

  const response = await fetch(`${BASE_URL}/addBookingData/booking`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, newBooking }),
  });

  if (!response.ok) {
    throw new Error("Failed to add booking");
  }

  return response.json();
};

export const updateAccountBalance = async (userId, newBalance) => {
  const response = await fetch(`${BASE_URL}/addBookingData/account-balance`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, newBalance }),
  });
  if (!response.ok) {
    throw new Error("Failed to update account balance");
  }
  return response.json();
};

export const updateBookingStatus = async (userId, bookingId, status) => {
  try {
    // const response = await fetch(`${BASE_URL}/bookings/${userId}/${bookingId}`);

    const response = await fetch(
      `${BASE_URL}/addBookingData/${userId}/${bookingId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(status),
      }
    );

    if (!response.ok) {
      throw new Error(`Error updating booking status: ${response.statusText}`);
    }

    return await response.json(); // Trả về dữ liệu JSON từ phản hồi
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const updateVetSchedule = async (vetId, date, slot) => {
  const response = await fetch(`${BASE_URL}/addBookingData/vet-schedule`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ vetId, date, slot }),
  });
  if (!response.ok) {
    throw new Error("Failed to update vet schedule");
  }
  return response.json();
};
