import { useState, useEffect } from "react";
import {
  Box,
  IconButton,
  useTheme,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { useContext } from "react";
import { ColorModeContext, tokens } from "../../../../theme";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import { auth } from "../../../../Components/firebase/firebase";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log(user);
        setUsername(user.displayName || user.email); // Use displayName if available, otherwise fallback to email
      } else {
        setUsername(""); // Clear username if no user is logged in
      }
    });

    return () => unsubscribe(); // Clean up the listener on unmount
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleHomeClick = () => {
    navigate("/");
    handleMenuClose();
  };

  const handleLogoutClick = () => {
    auth.signOut().then(() => {
      localStorage.clear();
      navigate("/");
    });
    handleMenuClose();
  };

  return (
    <Box display="flex" justifyContent="space-between" p={2}>
      <Typography variant="h6" fontSize={20} mr={2}>
        Welcome, {username}
      </Typography>

      {/* ICONS */}
      <Box display="flex" sx={{ alignItems: "center", gap: "16px" }}>
        <IconButton
          sx={{
            fontSize: "25px",
          }}
        >
          <NotificationsOutlinedIcon fontSize="inherit" />
        </IconButton>
        <IconButton
          sx={{
            fontSize: "25px",
          }}
        >
          <SettingsOutlinedIcon fontSize="inherit" />
        </IconButton>
        <IconButton
          onClick={handleMenuOpen}
          sx={{
            fontSize: "25px",
          }}
        >
          <PersonOutlinedIcon fontSize="inherit" />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <div className="dropdown-topbar">
            <MenuItem sx={{ fontSize: "15px" }} onClick={handleHomeClick}>
              Home
            </MenuItem>
            <MenuItem sx={{ fontSize: "15px" }} onClick={handleLogoutClick}>
              Logout
            </MenuItem>
          </div>
        </Menu>
      </Box>
    </Box>
  );
};

export default Topbar;
