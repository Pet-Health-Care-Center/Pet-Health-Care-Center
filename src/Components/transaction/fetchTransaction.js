const BASE_URL = 'https://mypetcare.onrender.com';


export const fetchTransactions = async () => {
  const response = await fetch(`${BASE_URL}/transaction/transactions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }

  return response.json();
};

export const updateUserBooking = async (data) => {
  const response = await fetch(`${BASE_URL}/transaction/update-booking`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update user booking');
  }

  return response.json();
};