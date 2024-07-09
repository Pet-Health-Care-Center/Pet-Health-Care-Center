

const BASE_URL = 'https://mypetcare.onrender.com/userData';

export const fetchUserById = async (userId) => {
  const response = await fetch(`${BASE_URL}/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user data');
  }
  return response.json();
};

export const updateUserById = async (userId, updates) => {
  const response = await fetch(`${BASE_URL}/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    throw new Error('Failed to update user data');
  }
  return response.json();
};


export const uploadAvatar = async (userId, file) => {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await fetch(`${BASE_URL}/${userId}/avatar`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload avatar');
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