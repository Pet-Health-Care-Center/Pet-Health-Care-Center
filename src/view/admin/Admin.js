import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { CssBaseline, ThemeProvider } from "@mui/material";
import "react-toastify/dist/ReactToastify.css";
import { ColorModeContext, useMode } from "../../theme";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import Topbar from "../../view/scenes/admin-scenes/global/Topbar";
import Sidebar from "../../view/scenes/admin-scenes/global/Sidebar";
import Dashboard from "../../view/scenes/admin-scenes/dashboard/index";
import Team from "../../view/scenes/admin-scenes/team/index";
import Bar from "../../view/scenes/admin-scenes/bar/index";
import Form from "../../view/scenes/admin-scenes/form/index";
import Line from "../../view/scenes/admin-scenes/line/index";
import Pie from "../../view/scenes/admin-scenes/pie/index";
import Service from "../../view/scenes/admin-scenes/services and cages/index";
import Calendar from "../../view/scenes/admin-scenes/calendar/calendar";
import RefundData from "../scenes/admin-scenes/refund/refundData";
import { auth } from "../../Components/firebase/firebase";
import { fetchUserById } from "../account/getUserData";

function Admin() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  const LoadingDots = () => {
    return (
      <div className="loading-dots">
        <div></div>
        <div></div>
        <div></div>
      </div>
    );
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const data = await fetchUserById(user.uid);
          const { role } = data;

          if (role === "user") {
            toast.error("You can't access this site!");
            navigate("/");
          } else if (role === "manager") {
            toast.error("You can't access this site!");
            navigate("/manager/dashboard");
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
    return <LoadingDots/>;
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
              <Route path="team" element={<Team />} />
              <Route path="addData" element={<Service />} />
              <Route path="form" element={<Form />} />
              <Route path="bar" element={<Bar />} />
              <Route path="pie" element={<Pie />} />
              <Route path="line" element={<Line />} />
              <Route path="refundData" element={<RefundData />} />
              <Route path="calendar" element={<Calendar />} />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default Admin;
