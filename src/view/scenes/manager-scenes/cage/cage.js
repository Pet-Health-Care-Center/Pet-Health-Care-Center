import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";

const Cage = () => {
  const [cages, setCages] = useState([]);
  const [vets, setVets] = useState([]);
  const [selectedVets, setSelectedVets] = useState({});

  useEffect(() => {
    const db = getDatabase();

    const cagesRef = ref(db, "cages");
    onValue(cagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const cageList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setCages(cageList);
      }
    });

    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const vetList = Object.keys(data)
          .map((key) => ({ uid: key, ...data[key] }))
          .filter((user) => user.role === "veterinarian");
        setVets(vetList);
        console.log(vetList);
      }
    });
  }, []);

  const handleVetChange = (cageId, vetId) => {
    setSelectedVets((prev) => ({
      ...prev,
      [cageId]: vetId,
    }));
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Cages</h1>
      <ul style={styles.list}>
        {cages.map((cage) => {
          const availableVets = vets.filter(
            (vet) =>
              !Object.values(selectedVets).includes(vet.uid) ||
              selectedVets[cage.id] === vet.uid
          );
          return (
            <li key={cage.id} style={styles.listItem}>
              <div style={styles.cageDetail}>
                <strong>ID:</strong> {cage.id}
              </div>
              <div style={styles.cageDetail}>
                <strong>Name:</strong> {cage.name}
              </div>
              <div style={styles.cageDetail}>
                <strong>Status:</strong> {cage.status}
              </div>
              <div style={styles.cageDetail}>
                <label>
                  <strong>Veterinarian:</strong>
                  <select
                    value={selectedVets[cage.id] || ""}
                    onChange={(e) => handleVetChange(cage.id, e.target.value)}
                    style={styles.select}
                  >
                    <option value="" disabled>
                      Select Veterinarian
                    </option>
                    {availableVets.map((vet) => (
                      <option key={vet.uid} value={vet.uid}>
                        {vet.fullname}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    fontFamily: "'Arial', sans-serif",
  },
  header: {
    fontSize: "2em",
    textAlign: "center",
    marginBottom: "20px",
  },
  list: {
    listStyleType: "none",
    padding: 0,
  },
  listItem: {
    border: "1px solid #ccc",
    borderRadius: "10px",
    padding: "15px",
    margin: "10px 0",
    backgroundColor: "#f9f9f9",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  cageDetail: {
    fontSize: "1.8em",
    margin: "5px 0",
    color: "black",
  },
  select: {
    marginLeft: "10px",
    padding: "5px",
    color: "black",
    fontSize: "1.2em",
  },
};

export default Cage;
