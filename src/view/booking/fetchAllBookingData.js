const BASE_URL = "https://mypetcare.onrender.com";
const LOCAL_BASE_URL = "http://localhost:5000";

export const fetchServices = async () => {
  const response = await fetch(`${BASE_URL}/allBookingData/services`);
  if (!response.ok) {
    throw new Error("Failed to fetch services");
  }
  return response.json();
};

export const fetchVets = async () => {
  const response = await fetch(`${BASE_URL}/allBookingData/vets`);
  if (!response.ok) {
    throw new Error("Failed to fetch veterinarians");
  }
  return response.json();
};

export const fetchAllBookings = async () => {
  const response = await fetch(`${BASE_URL}/allBookingData/bookings`);
  if (!response.ok) {
    throw new Error("Failed to fetch bookings");
  }
  return response.json();
};

export const updateCageHistory = async (bookingId, cageHistory) => {
  try {
    // http://localhost:5000/allBookingData/updateCageHistory/BK0207072855
    const response = await fetch(
      `${LOCAL_BASE_URL}/allBookingData/updateCageHistory/${bookingId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cageHistory: cageHistory }),
      }
    );
    if (!response.ok) {
      throw new Error("Failed to add cage data");
    }
    return response.json();
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
