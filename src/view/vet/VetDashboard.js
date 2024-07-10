import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { CssBaseline, ThemeProvider } from "@mui/material";
import "react-toastify/dist/ReactToastify.css";
import { ColorModeContext, useMode } from "../../theme";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Schedule from "../scenes/vet-scenes/schedule/shedule";
import Cage from "../scenes/vet-scenes/cage/cage";
import MedicalRecord from "../scenes/vet-scenes/medicalRecord/MedicalRecord";

import "react-toastify/dist/ReactToastify.css";

import Topbar from "../scenes/vet-scenes/global/Topbar";
import Sidebar from "../scenes/vet-scenes/global/Sidebar";
import Dashboard from "../scenes/vet-scenes/dashboard";

import { auth } from "../../Components/firebase/firebase";
import { fetchUserById } from "../account/getUserData";

function VetDashboard() {
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
          } else if (role === "manager") {
            toast.error("You can't access this site!");
            navigate("/manager/dashboard");
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
              <Route path="cage" element={<Cage />} />
              <Route
                path="booking/medical-record/:userId/:bookingId"
                element={<MedicalRecord />}
              />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default VetDashboard;
