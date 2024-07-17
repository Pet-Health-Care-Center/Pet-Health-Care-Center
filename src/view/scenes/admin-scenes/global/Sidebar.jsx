import { useState, useEffect } from "react";
import { ProSidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../../../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import PieChartOutlineOutlinedIcon from "@mui/icons-material/PieChartOutlineOutlined";
import PaidIcon from "@mui/icons-material/Paid";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PetsIcon from "@mui/icons-material/Pets";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../../Components/firebase/firebase";
import userProfileImage from "../../../../public/assets/user.png";

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

const SubCategoryItem = ({ title, to, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <MenuItem
      active={selected === title}
      onClick={() => setSelected(title)}
      style={{
        color: "white",
        backgroundColor:
          selected === title ? colors.primary[700] : "transparent",
        borderRadius: selected === title ? "5px" : "0",
        maxWidth: "90%",
        marginLeft: "5px",
      }}
    >
      <Typography sx={{ fontSize: "14px", color: "white" }}>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
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
      case "/admin/dashboard":
        setSelected("Dashboard");
        break;
      case "/admin/team":
        setSelected("Manage User");
        break;
      case "/admin/addData":
        setSelected("Add Data");
        break;
      case "/admin/refundData":
        setSelected("Refund Data");
        break;
      case "/admin/bar":
        setSelected("Bar Chart");
        break;
      case "/admin/pie":
        setSelected("Pie Chart");
        break;
      case "/admin/line":
        setSelected("Line Chart");
        break;
      case "/admin/revenue/daily":
        setSelected("Daily Revenue");
        break;
      case "/admin/revenue/weekly":
        setSelected("Weekly Revenue");
        break;
      case "/admin/revenue/monthly":
        setSelected("Monthly Revenue");
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
        "& .pro-item-content": {
          fontSize: "16px",
          color: "white",
          fontWeight: "400",
          lineHeight: "1.5",
        },
        "& .pro-arrow": {
          margin: "20px 15px",
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
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
                  ADMIN
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
                  src={userProfileImage}
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
                  color="white"
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
              to="/admin/dashboard"
              icon={<HomeOutlinedIcon sx={{ fontSize: "22px" }} />}
              selected={selected}
              setSelected={setSelected}
            />

            <Typography
              variant="h6"
              color="white"
              sx={{ m: "15px 0 5px 16px", fontSize: "18px" }}
            >
              Data
            </Typography>

            <SubMenu
              title="Revenue Statistics"
              icon={<PaidIcon sx={{ fontSize: "22px", color: "white" }} />}
              opened="false"
            >
              <SubCategoryItem
                title="Daily Revenue"
                to="/admin/revenue/daily"
                selected={selected}
                setSelected={setSelected}
              />
              <SubCategoryItem
                title="Weekly Revenue"
                to="/admin/revenue/weekly"
                selected={selected}
                setSelected={setSelected}
              />
              <SubCategoryItem
                title="Monthly Revenue"
                to="/admin/revenue/monthly"
                selected={selected}
                setSelected={setSelected}
              />
            </SubMenu>

            <Item
              title="Manage User"
              to="/admin/team"
              icon={<PeopleOutlinedIcon sx={{ fontSize: "22px" }} />}
              selected={selected}
              setSelected={setSelected}
            />

            <Item
              title="Add Data"
              to="/admin/addData"
              icon={<PetsIcon sx={{ fontSize: "22px" }} />}
              selected={selected}
              setSelected={setSelected}
            />

            <Item
              title="Refund Data"
              to="/admin/refundData"
              icon={<AttachMoneyIcon sx={{ fontSize: "22px" }} />}
              selected={selected}
              setSelected={setSelected}
            />

            <Typography
              variant="h6"
              color="white"
              sx={{ m: "15px 0 5px 16px", fontSize: "18px" }}
            >
              Charts
            </Typography>
            <Item
              title="Bar Chart"
              to="/admin/bar"
              icon={<BarChartOutlinedIcon sx={{ fontSize: "22px" }} />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Pie Chart"
              to="/admin/pie"
              icon={<PieChartOutlineOutlinedIcon sx={{ fontSize: "22px" }} />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Line Chart"
              to="/admin/line"
              icon={<TimelineOutlinedIcon sx={{ fontSize: "22px" }} />}
              selected={selected}
              setSelected={setSelected}
            />
          </Box>
        </Menu>
        {!isCollapsed && (
          <Box textAlign="start" padding="30px" mt="auto">
            <Box display="flex" alignItems="center">
              <Box>
                <Typography fontSize={20} fontWeight="bold" color="white">
                  {username}
                </Typography>
                <Typography fontSize={14} color="white">
                  {email}
                </Typography>
              </Box>
              <Box fontSize={20} fontWeight="bold" color="white" marginLeft={2}>
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
