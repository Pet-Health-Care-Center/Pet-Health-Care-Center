import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from "@mui/material";
import { getDatabase, ref, set, push, get } from "firebase/database";
import { toast } from 'react-toastify';

const Services = () => {
  const initialServiceState = {
    name: '',
    price: 0,
    image: '',
    description: ''
  };

  const [service, setService] = useState(initialServiceState);
  const db = getDatabase();
  
  const addService = (service) => {
    const newServiceRef = ref(db, 'services/' + service.name);
    return set(newServiceRef, service);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setService({
      ...service,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addService(service).then(() => {
      toast.success("Service added successfully!");
      setService(initialServiceState);  // Reset the form to initial state
    }).catch((error) => {
      toast.error("Failed to add service: " + error.message);  // Changed alert to toast for consistency
    });
  };
  const initialCage = {
    name: '',
    status: 'Available',
    id: ''
  };

  const [cage, setCage] = useState(initialCage);

  const addCage = (cage) => {
    const cagesRef = ref(db, 'cages');
    return push(cagesRef, cage);
  };

  const handleChangeCage = (e) => {
    const { name, value } = e.target;
    setCage({
      ...cage,
      [name]: value,
    });
  };

  const handleSubmitCage = async (e) => {
    e.preventDefault();
    
    const cagesRef = ref(db, 'cages');
    const snapshot = await get(cagesRef);
    const cagesData = snapshot.val() || {};

    const isNameOrIdDuplicate = Object.values(cagesData).some(
      (existingCage) => existingCage.name === cage.name || existingCage.id === cage.id
    );

    if (isNameOrIdDuplicate) {
      toast.error("Name or ID already exists. Please use a unique name and ID.");
    } else {
      addCage(cage)
        .then(() => {
          toast.success("Cage added successfully!");
          setCage(initialCage);
        })
        .catch((error) => {
          toast.error("Failed to add cage: " + error.message);
        });
    }
  };
  const styles = {
    container: {
      p: 3,
      maxWidth: 600,
      mx: 'auto',
      backgroundColor: '#2e2e2e',
      borderRadius: 2,
      boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)',
      color: '#ffffff',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
    },
    textField: {
      mb: 2,
      input: {
        color: '#ffffff',
      },
      label: {
        color: '#b0b0b0',
      },
      '.MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: '#444444',
        },
        '&:hover fieldset': {
          borderColor: '#888888',
        },
        '&.Mui-focused fieldset': {
          borderColor: '#ffffff',
        },
      },
    },
    button: {
      mt: 1,
      backgroundColor: '#007bff',
      width: "20%",
      mx: 'auto',
      '&:hover': {
        backgroundColor: '#0056b3',
      },
    },
  };

  return (
    <Box>
      <Box  sx={styles.container}>

      <Typography variant="h4" component="h1" gutterBottom>
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
            sx={styles.textField}
            />
        </Box>
        <Button type="submit" variant="contained" color="primary"  sx={styles.button}>
          Add Service
        </Button>
      </form>
      </Box>
      <Box style={{
        marginTop: "60px"
      }} sx={styles.container}>

      <Typography variant="h4" component="h1" gutterBottom>
        Add Cage
      </Typography>
      <form onSubmit={handleSubmitCage} style={styles.form}>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={cage.name}
            onChange={handleChangeCage}
            required
            sx={styles.textField}
            />
        </Box>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="ID"
            name="id"
            value={cage.id}
            onChange={handleChangeCage}
            required
            sx={styles.textField}
            />
        </Box>
        <Button type="submit" variant="contained" color="primary"  sx={styles.button}>
          Add Cage
        </Button>
      </form>
            </Box>
    </Box>
  );
};

export default Services;
