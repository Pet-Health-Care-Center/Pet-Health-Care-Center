import { useState, useEffect } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../../../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../../Components/firebase/firebase";

const Item = ({ title, to, icon, selected, setSelected, isCollapsed }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <MenuItem
      active={selected === title}
      style={{
        color: "white",
        backgroundColor:
          selected === title ? colors.primary[700] : "transparent",
        borderRadius: selected === title ? "5px" : "0",
        maxWidth: "90%",
        marginLeft: "5px",
      }}
      onClick={() => setSelected(title)}
      icon={<Box sx={{ color: "white", fontSize: "28px" }}>{icon}</Box>}
    >
      <Typography sx={{ fontSize: "16px", color: "white" }}>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log(user);
        setUsername(user.displayName || user.email);
        setEmail(user.email);
      } else {
        setUsername("");
        setEmail("");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    switch (location.pathname) {
      case "/vet/dashboard":
        setSelected("Dashboard");
        break;
      case "/vet/schedule":
        setSelected("Schedule");
        break;
      case "/vet/manageSchedule":
        setSelected("Manage Schedule");
        break;
      case "/vet/cage":
        setSelected("Pet In Cage");
        break;
      default:
        setSelected("Dashboard");
    }
  }, [location.pathname]);

  return (
    <Box
      sx={{
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "10px 35px 10px 20px !important",
          fontSize: "22px",
          color: "white",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed} style={{ width: "20px" }}>
        <Menu iconShape="square">
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={
              isCollapsed ? (
                <MenuOutlinedIcon sx={{ fontSize: "22px", color: "white" }} />
              ) : undefined
            }
            style={{
              margin: "10px 0 20px 0",
              color: "white",
              fontSize: "22px",
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography variant="h3" color="white">
                  VET
                </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon sx={{ fontSize: "20px", color: "white" }} />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <img
                  alt="profile-user"
                  width="120px"
                  height="120px"
                  src={`../../assets/user.png`}
                  style={{
                    cursor: "pointer",
                    borderRadius: "100%",
                    borderColor: "grey",
                    borderStyle: "solid",
                    backgroundColor: "white",
                  }}
                />
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h2"
                  color={colors.grey[100]}
                  fontWeight="bold"
                  sx={{ m: "10px 0 0 0" }}
                >
                  Pet Health Care
                </Typography>
                <Typography variant="h5" color={colors.greenAccent[500]}>
                  System
                </Typography>
              </Box>
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
              title="Dashboard"
              to="/vet/dashboard"
              icon={<HomeOutlinedIcon sx={{ fontSize: "22px" }} />}
              selected={selected}
              setSelected={setSelected}
            />

            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Data
            </Typography>
            <Item
              title="Schedule"
              to="/vet/schedule"
              icon={<PeopleOutlinedIcon sx={{ fontSize: "22px" }} />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Manage Schedule"
              to="/vet/manageSchedule"
              icon={<PeopleOutlinedIcon sx={{ fontSize: "22px" }} />}
              selected={selected}
              setSelected={setSelected}
            />

            <Item
              title="Pet In Cage"
              to="/vet/cage"
              icon={<CalendarTodayOutlinedIcon sx={{ fontSize: "22px" }} />}
              selected={selected}
              setSelected={setSelected}
            />
          </Box>
        </Menu>
        {!isCollapsed && (
          <Box textAlign="start" padding="30px" mt="auto">
            <Box display="flex" alignItems="center">
              <Box>
                <Typography
                  fontSize={20}
                  fontWeight="bold"
                  color={colors.grey[100]}
                >
                  {username}
                </Typography>
                <Typography fontSize={14} color={colors.grey[100]}>
                  {email}
                </Typography>
              </Box>
              <Box
                fontSize={20}
                fontWeight="bold"
                color={colors.grey[100]}
                marginLeft={2}
              >
                ⋮
              </Box>
            </Box>
          </Box>
        )}
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
