const BASE_URL = 'http://localhost:5000';


export const addBooking = async (userId, newBooking) => {
  console.log('Sending addBooking request with:', { userId, newBooking });

  const response = await fetch(`${BASE_URL}/addBookingData/booking`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, newBooking }),
  });

  if (!response.ok) {
    throw new Error('Failed to add booking');
  }

  return response.json();
};

export const updateAccountBalance = async (userId, newBalance) => {
  const response = await fetch(`${BASE_URL}/addBookingData/account-balance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, newBalance }),
  });
  if (!response.ok) {
    throw new Error('Failed to update account balance');
  }
  return response.json();
};

export const updateVetSchedule = async (vetId, date, slot) => {
  const response = await fetch(`${BASE_URL}/addBookingData/vet-schedule`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ vetId, date, slot }),
  });
  if (!response.ok) {
    throw new Error('Failed to update vet schedule');
  }
  return response.json();
};