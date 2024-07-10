import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { CssBaseline, ThemeProvider } from "@mui/material";
import "react-toastify/dist/ReactToastify.css";
import { ColorModeContext, useMode } from "../../theme";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Schedule from "../scenes/manager-scenes/schedule/shedule";

import "react-toastify/dist/ReactToastify.css";

import Topbar from "../scenes/manager-scenes/global/Topbar";
import Sidebar from "../scenes/manager-scenes/global/Sidebar";
import Dashboard from "../scenes/manager-scenes/dashboard";
import VetManagement from "../scenes/manager-scenes/vetManagement/vetManagement";
import Cage from "../scenes/manager-scenes/cage/cage";

import { auth } from "../../Components/firebase/firebase";
import Booking from "../scenes/manager-scenes/manageBooking/manageBooking";
import { fetchUserById } from "../account/getUserData";

function ManagerDashboard() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const data = await fetchUserById(user.uid);
          const { role } = data;

          if (role === "user") {
            toast.error("You can't access this site!");
            navigate("/");
          } else if (role === "admin") {
            toast.error("You can't access this site!");
            navigate("/admin/dashboard");
          } else if (role === "veterinarian") {
            toast.error("You can't access this site!");
            navigate("/vet/dashboard");
          } else {
            setUser(user);
            setUserRole(role);
            setLoading(false);
          }
        } catch (error) {
          toast.error("Failed to fetch user data");
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
        navigate("/signIn");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return;
  }

  if (!user || !userRole) {
    return <Navigate to="/signIn" />;
  }

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ToastContainer />
        <div className="app">
          <Sidebar isSidebar={isSidebar} />
          <main className="content">
            <Topbar setIsSidebar={setIsSidebar} />
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="schedule" element={<Schedule />} />
              <Route path="manageBooking" element={<Booking />} />
              <Route path="cage" element={<Cage />} />
              <Route path="vetManagement" element={<VetManagement />} />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default ManagerDashboard;
