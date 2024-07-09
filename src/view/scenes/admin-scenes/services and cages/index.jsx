import React, { useState, useEffect } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";

import { toast } from "react-toastify";
import { getCages, addNewCage, addNewService } from "./getServiceNCageData";

const Services_Cages = () => {
  const initialServiceState = {
    name: "",
    price: 0,
    image: "",
    description: "",
  };

  const initialCage = {
    name: "",
    status: "Available",
    id: "",
  };

  const [cage, setCage] = useState(initialCage);
  const [cages, setCages] = useState([]);
  const [service, setService] = useState(initialServiceState);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const serviceData = {
      [service.name]: {
        description: service.description,
        image: service.image,
        price: service.price,
        name: service.name,
      },
    };

    try {
      await addNewService(serviceData);
      toast.success("Service added successfully!");
      setService(initialServiceState);
    } catch (error) {
      console.log(error);
      toast.error("Failed to add new service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setService({
      ...service,
      [name]: value,
    });
  };

  const fetchCages = async () => {
    try {
      const cagesData = await getCages();
      console.log(cagesData);
      setCages(Object.values(cagesData));
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch cage. Please try again.");
    }
  };

  useEffect(() => {
    fetchCages();
    const intervalId = setInterval(fetchCages, 10000);

    return () => clearInterval(intervalId);
  }, []);

  const handleSubmitCage = async (e) => {
    e.preventDefault();
    setLoading(true);

    const cageCount = cages.length + 1;
    const newCage = {
      id: `CA${String(cageCount).padStart(3, "0")}`,
      name: `Cage ${cageCount}`,
      status: "Available",
    };

    try {
      await addNewCage(newCage);
      setCages([...cages, newCage]);
      toast.success("Cage added successfully!");
      setCage(initialCage);
    } catch (error) {
      toast.error("Failed to add cage: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      p: 3,
      maxWidth: 1600,
      mx: "auto",
      backgroundColor: "white",
      borderRadius: 2,
      boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)",
      color: "#ffffff",
    },
    form: {
      display: "flex",
      flexDirection: "column",
    },
    textField: {
      mb: 2,
      input: {
        color: "black",
      },
      label: {
        color: "#b0b0b0",
      },
      ".MuiOutlinedInput-root": {
        "& fieldset": {
          borderColor: "#444444",
        },
        "&:hover fieldset": {
          borderColor: "#888888",
        },
        "&.Mui-focused fieldset": {
          borderColor: "#ffffff",
        },
      },
    },
    button: {
      mt: 1,
      fontSize: "20px",
      backgroundColor: "#007bff",
      width: "12%",
      mx: "auto",
      "&:hover": {
        backgroundColor: "#0056b3",
      },
    },
    gridContainer: {
      mt: 2,
      display: "grid",
      gridTemplateColumns: "repeat(8, 1fr)",
      gap: 2,
      fontSize: "20px",
    },
    gridItem: (status) => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: status === "Occupied" ? "#ff4d4d" : "#4caf50",
      color: "#ffffff",
      height: "50px",
      borderRadius: 2,
    }),
  };

  return (
    <Box>
      <Box sx={styles.container}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          color="black"
          fontSize="30px"
        >
          Add Service
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={service.name}
              onChange={handleChange}
              required
              InputLabelProps={{
                style: {
                  fontSize: "1.6rem",
                  color: "black",
                },
              }}
              InputProps={{
                style: {
                  fontSize: "1.5rem",
                  color: "black",
                },
              }}
              sx={styles.textField}
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Price"
              name="price"
              type="number"
              value={service.price}
              onChange={handleChange}
              required
              InputLabelProps={{
                style: {
                  fontSize: "1.6rem",
                  color: "black",
                },
              }}
              InputProps={{
                style: {
                  fontSize: "1.5rem",
                  color: "black",
                },
              }}
              sx={styles.textField}
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Image URL"
              name="image"
              value={service.image}
              onChange={handleChange}
              required
              InputLabelProps={{
                style: {
                  fontSize: "1.6rem",
                  color: "black",
                },
              }}
              InputProps={{
                style: {
                  fontSize: "1.5rem",
                  color: "black",
                },
              }}
              sx={styles.textField}
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={service.description}
              onChange={handleChange}
              multiline
              rows={4}
              required
              InputLabelProps={{
                style: {
                  fontSize: "1.6rem",
                  color: "black",
                },
              }}
              InputProps={{
                style: {
                  fontSize: "1.5rem",
                  color: "black",
                },
              }}
              sx={styles.textField}
            />
          </Box>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            sx={styles.button}
          >
            {loading ? "Adding..." : "Add Service"}
          </Button>
        </form>
      </Box>
      <Box
        style={{
          marginTop: "60px",
        }}
        sx={styles.container}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          color="black"
          fontSize="30px"
        >
          Add Cage
        </Typography>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          sx={styles.button}
          onClick={handleSubmitCage}
        >
          {loading ? "Adding..." : "Add Cage"}
        </Button>
        <Box sx={styles.gridContainer}>
          {cages.map((cage, index) => (
            <Box key={index} sx={styles.gridItem(cage.status)}>
              {cage.id}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Services_Cages;
