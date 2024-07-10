const BASE_URL = "https://mypetcare.onrender.com/userData";
const REFUND_BASE_URL = "http://localhost:5000/userData";

export const fetchUserById = async (userId) => {
  const response = await fetch(`${BASE_URL}/${userId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch user data");
  }
  return response.json();
};

export const updateUserById = async (userId, updates) => {
  const response = await fetch(`${BASE_URL}/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    throw new Error("Failed to update user data");
  }
  return response.json();
};

export const uploadAvatar = async (userId, file) => {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await fetch(`${BASE_URL}/${userId}/avatar`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload avatar");
  }

  return response.json();
};

export const getAllUsers = async () => {
  const response = await fetch(`${BASE_URL}`);
  if (!response.ok) {
    throw new Error("Failed to fetch user data");
  }
  return response.json();
};

export const getRefundMoneyByUserId = async (userId) => {
  // https://localhost:5000/userData/refund/5fYbf1gw6xPGwQ5pgO7VHwICYg92
  // http://localhost:5000/userData/refund/5fYbf1gw6xPGwQ5pgO7VHwICYg92
  const response = await fetch(`${REFUND_BASE_URL}/refund/${userId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch user data");
  }
  return response.json();
};

export const updateRefundMoneyByUserId = async (userId, refundKey, updates) => {
  const response = await fetch(
    `${REFUND_BASE_URL}/refund/${userId}/${refundKey}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to update user data");
  }
  return response.json();
};
