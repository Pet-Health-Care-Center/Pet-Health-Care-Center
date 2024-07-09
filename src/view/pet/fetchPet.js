const BASE_URL = 'https://mypetcare.onrender.com';


export const fetchPetsByUserId = async (userId) => {
  const response = await fetch(`${BASE_URL}/pets/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch pets');
  }
  return response.json();
};

export const fetchPetDetails = async (userId, petId) => {
    const response = await fetch(`${BASE_URL}/pets/${userId}/${petId}`);
    if (!response.ok) {
      console.error('Failed to fetch pet details', response.statusText);
      throw new Error('Failed to fetch pet details');
    }
    const data = await response.json();
    console.log('Fetched pet details:', data);
    return data;
  };
  
  export const fetchPetMedicalHistory = async (userId, petId) => {
    const response = await fetch(`${BASE_URL}/pets/${userId}/${petId}/medicalHistory`);
    if (!response.ok) {
      console.error('Failed to fetch medical history', response.statusText);
      throw new Error('Failed to fetch medical history');
    }
    const data = await response.json();
    console.log('Fetched medical history:', data);
    return data;
  };

  export const updatePetDetails = async (userId, petId, updatedPetData) => {
    try {
      const response = await fetch(`${BASE_URL}/pets/${userId}/${petId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPetData),
      });
      if (!response.ok) {
        throw new Error(`Error updating pet details: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  export const addPet = async (userId, petData) => {
    try {
      const response = await fetch(`${BASE_URL}/pets/${userId}/addPet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(petData),
      });
      if (!response.ok) {
        throw new Error(`Error adding pet: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };