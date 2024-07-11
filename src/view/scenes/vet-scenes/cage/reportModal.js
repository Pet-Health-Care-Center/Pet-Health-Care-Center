import { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const ReportModal = ({ open, onClose, onConfirm }) => {
  const [description, setDescription] = useState("");

  const handleConfirm = () => {
    onConfirm(description);
    setDescription(""); // Clear the input after confirming
  };

  const handleClose = () => {
    onClose();
    setDescription(""); // Clear the input when modal is closed
  };

  useEffect(() => {
    if (!open) {
      setDescription("");
    }
  }, [open]);

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "white",
          borderRadius: 1,
          boxShadow: 24,
          p: 4,
          outline: "none",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h6"
            component="h2"
            sx={{ color: "black", fontSize: "1.45rem" }}
          >
            Enter Report Description
          </Typography>
          <IconButton
            onClick={handleClose}
            size="small"
            sx={{ color: "black" }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <TextField
          fullWidth
          multiline
          rows={4}
          margin="normal"
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "black",
                fontSize: "2rem",
              },
              "&:hover fieldset": {
                borderColor: "black",
              },
              "&.Mui-focused fieldset": {
                borderColor: "black",
              },
            },
            "& .MuiInputBase-input": {
              color: "black",
              fontSize: "2rem", // Increase font size for the input
              padding: "2px",
            },
          }}
        />
        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button
            onClick={handleClose}
            sx={{
              mr: 2,
              color: "white",
              bgcolor: "gray",
              "&:hover": { bgcolor: "darkgray" },
              padding: "12px",
              fontSize: "1.2rem",
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirm}
            sx={{
              color: "white",
              bgcolor: "blue",
              "&:hover": { bgcolor: "darkblue" },
              fontSize: "1.2rem",
            }}
          >
            Confirm
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ReportModal;
