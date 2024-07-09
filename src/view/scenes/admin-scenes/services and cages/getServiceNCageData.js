const BASE_URL = "https://mypetcare.onrender.com";

export const getServices = async () => {
  const response = await fetch(`${BASE_URL}/services_cages/getServices`);
  if (!response.ok) {
    throw new Error("Failed to fetch services data");
  }
  return response.json();
};

export const getCages = async () => {
  const response = await fetch(`${BASE_URL}/services_cages/getCages`);
  if (!response.ok) {
    throw new Error("Failed to fetch cages data");
  }
  return response.json();
};

export const addNewService = async (serviceData) => {
  const response = await fetch(`${BASE_URL}/services_cages/addNewService`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(serviceData),
  });
  if (!response.ok) {
    throw new Error("Failed to add service data");
  }
  return response.json();
};

export const addNewCage = async (cageData) => {
  const response = await fetch(`${BASE_URL}/services_cages/addNewCage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cageData),
  });
  if (!response.ok) {
    throw new Error("Failed to add cage data");
  }
  return response.json();
};
