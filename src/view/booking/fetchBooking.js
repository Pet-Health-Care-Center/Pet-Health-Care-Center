
const BASE_URL = 'http://localhost:5000';


export const fetchBookings = async (userId) => {
  const response = await fetch(`${BASE_URL}/bookings/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch bookings');
  }
  return response.json();
};


export const cancelBooking = async (bookingData) => {
  const response = await fetch(`${BASE_URL}/cancel-booking`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bookingData),
  });
  if (!response.ok) {
    throw new Error('Failed to cancel booking');
  }
  return response.json();
};

export const fetchBookingDetails = async (userId, bookingId) => {
  try {
    const response = await fetch(`${BASE_URL}/bookings/${userId}/${bookingId}`);
    if (!response.ok) {
      throw new Error(`Error fetching booking details: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const fetchAllBookingsUser = async (userId) => {
  try {
    const response = await fetch(`${BASE_URL}/bookings/fetchAll/${userId}/`);
    if (!response.ok) {
      throw new Error(`Error fetching booking details: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
