import React, { useEffect, useState } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../../../../theme";
import { mockDataTeam } from "../../../data/mockData";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import Header from "../../../../Components/dashboardChart/Header";
import StatBox from "../../../../Components/dashboardChart/StatBox";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const getCurrentDate = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [yearlyRevenue, setYearlyRevenue] = useState(0);
  const [monthlyRevenueChange, setMonthlyRevenueChange] = useState("0%");
  const [yearlyRevenueChange, setYearlyRevenueChange] = useState("0%");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getTotalPaid = (date, type) => {
    let totalPaid = 0;

    mockDataTeam.forEach((user) => {
      for (const bookingId in user.bookings) {
        const booking = user.bookings[bookingId];

        if (
          !["Paid", "Checked-in", "Rated", "Cancelled"].includes(booking.status)
        )
          continue;

        let inputStr = booking.bookingId;
        let strippedStr = inputStr.slice(2);
        let day = strippedStr.slice(0, 2);
        let month = strippedStr.slice(2, 4);
        let formattedDate = `${new Date().getFullYear()}-${month}-${day}`;

        let bookingTotalPaid = booking.totalPaid || 0;

        if (booking.status === "Cancelled") {
          bookingTotalPaid *= 0.25;
        }

        if (type === "month" && formattedDate.startsWith(date)) {
          totalPaid += bookingTotalPaid;
        } else if (type === "year" && formattedDate.startsWith(date)) {
          totalPaid += bookingTotalPaid;
        }
      }
    });

    return totalPaid;
  };

  useEffect(() => {
    const updateRevenue = () => {
      const currentMonth = `${selectedYear}-${String(selectedMonth).padStart(
        2,
        "0"
      )}`;
      const currentYear = selectedYear.toString();

      // Monthly Revenue
      const totalPaidForMonth = getTotalPaid(currentMonth, "month");
      setMonthlyRevenue(totalPaidForMonth);

      // Yearly Revenue
      const totalPaidForYear = getTotalPaid(currentYear, "year");
      setYearlyRevenue(totalPaidForYear);
    };

    updateRevenue();
  }, [selectedMonth, selectedYear]);

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  return (
    <Box m="20px">
      {/* HEADER */}
      <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
        mt="20px"
      >
        {/* MONTHLY REVENUE */}
        <Box
          gridColumn="span 6"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          position="relative"
        >
          <Box position="absolute" left="10px">
            <Typography variant="h6" mb="10px">
              Select Month:
            </Typography>
            <select value={selectedMonth} onChange={handleMonthChange}>
              {[...Array(12).keys()].map((month) => (
                <option key={month + 1} value={month + 1}>
                  {month + 1}
                </option>
              ))}
            </select>
          </Box>
          <StatBox
            title={`${(monthlyRevenue * 1000).toLocaleString("en-US", {
              maximumFractionDigits: 0,
            })} VND`}
            subtitle="Monthly Revenue"
            progress="0.50"
            increase={monthlyRevenueChange}
            icon={
              <PointOfSaleIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>

        {/* YEARLY REVENUE */}
        <Box
          gridColumn="span 6"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          position="relative"
        >
          <Box position="absolute" right="10px">
            <Typography variant="h6" mb="10px">
              Select Year:
            </Typography>
            <select value={selectedYear} onChange={handleYearChange}>
              {[...Array(10).keys()].map((year) => (
                <option key={year + 2020} value={year + 2020}>
                  {year + 2020}
                </option>
              ))}
            </select>
          </Box>
          <StatBox
            title={`${(yearlyRevenue * 1000).toLocaleString("en-US", {
              maximumFractionDigits: 0,
            })} VND`}
            subtitle="Yearly Revenue"
            progress="0.50"
            increase={yearlyRevenueChange}
            icon={
              <PointOfSaleIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
