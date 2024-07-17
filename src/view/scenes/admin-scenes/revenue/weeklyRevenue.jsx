import React, { useEffect, useState } from "react";
import { Box, Typography, useTheme, MenuItem, Select } from "@mui/material";
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

  const getWeekDates = (startDate) => {
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      weekDates.push(formatDate(date));
    }
    return weekDates;
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
    // return `${day}-${month}-${year}`;
  };

  const getWeeksArray = (selectedMonth) => {
    const weeksArray = [];
    const currentDate = new Date(selectedMonth);
    currentDate.setDate(1); // Set to the first day of the selected month

    while (currentDate.getMonth() === selectedMonth.getMonth()) {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Monday of current week

      const endOfWeek = new Date(currentDate);
      endOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 7); // Sunday of current week

      weeksArray.push({
        start: formatDate(startOfWeek),
        end: formatDate(endOfWeek),
      });

      currentDate.setDate(currentDate.getDate() + 7); // Move to next week
    }

    return weeksArray;
  };
  const [weeklyRevenue, setWeeklyRevenue] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentDate()); // Initialize to current month
  const [selectedWeek, setSelectedWeek] = useState(
    getWeeksArray(new Date())[0].start
  );
  const [monthSelected, setMonthSelected] = useState(false);

  const handleWeekChange = (event) => {
    setSelectedWeek(event.target.value);
  };

  const getTotalPaid = (dates) => {
    const dailyTotals = dates.map((date) => {
      let dailyTotal = 0;
      mockDataTeam.forEach((user) => {
        for (const bookingId in user.bookings) {
          const booking = user.bookings[bookingId];
          if (
            !["Paid", "Checked-in", "Rated", "Cancelled"].includes(
              booking.status
            )
          )
            continue;

          const inputStr = booking.bookingId;
          const strippedStr = inputStr.slice(2);
          const day = strippedStr.slice(0, 2);
          const month = strippedStr.slice(2, 4);
          const formattedDate = `${new Date().getFullYear()}-${month}-${day}`;
          let bookingTotalPaid = booking.totalPaid || 0;

          if (booking.status === "Cancelled") {
            bookingTotalPaid *= 0.25;
          }

          if (formattedDate === date) {
            dailyTotal += bookingTotalPaid;
          }
        }
      });
      return dailyTotal;
    });

    return dailyTotals;
  };

  useEffect(() => {
    const updateRevenue = () => {
      const startDate = new Date(selectedWeek);
      const weekDates = getWeekDates(startDate);
      const weeklyTotals = getTotalPaid(weekDates);
      setWeeklyRevenue(weeklyTotals);
    };

    updateRevenue();
  }, [selectedWeek]);

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
    // Reset selectedWeek to the first week of the selected month
    setSelectedWeek(getWeeksArray(new Date(event.target.value))[0].start);
    setMonthSelected(true);
  };

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
      </Box>

      {/* MONTH SELECTION */}
      <Box display="flex" alignItems="center" mb="20px">
        <Typography variant="h6" fontSize="20px">
          Select Month:
        </Typography>
        <Select
          value={selectedMonth}
          onChange={handleMonthChange}
          style={{
            marginLeft: 10,
            fontSize: "16px",
            backgroundColor: "white",
            color: "black",
          }}
          sx={{
            "& .MuiSvgIcon-root": {
              color: "black",
              fontSize: "20px",
            },
          }}
        >
          {Array.from({ length: 12 }, (_, index) => {
            const month = new Date(new Date().getFullYear(), index, 1);
            const currentMonth = new Date();
            return (
              <MenuItem
                key={index}
                defaultValue={new Date(currentMonth.getMonth())}
                value={formatDate(month)}
                sx={{
                  fontSize: "14px",
                  backgroundColor: "white",
                  color: "black",
                  "&.Mui-selected": {
                    backgroundColor: "#b5aeae",
                  },
                  "&.MuiMenuItem-root:hover": {
                    backgroundColor: "#f0f0f0",
                  },
                }}
              >
                {month.toLocaleString("default", { month: "long" })}
              </MenuItem>
            );
          })}
        </Select>

        {/* WEEK SELECTION */}
        <Typography variant="h6" fontSize="20px" ml="20px">
          Select Week:
        </Typography>
        <Select
          value={selectedWeek}
          disabled={!monthSelected}
          onChange={handleWeekChange}
          style={{
            marginLeft: 10,
            fontSize: "16px",
            backgroundColor: "white",
            color: "black",
          }}
          sx={{
            "& .MuiSvgIcon-root": {
              color: "black",
              fontSize: "20px",
            },
          }}
        >
          {getWeeksArray(new Date(selectedMonth)).map((week, index) => (
            <MenuItem
              key={index}
              value={week.start}
              sx={{
                fontSize: "14px",
                backgroundColor: "white",
                color: "black",

                "&.Mui-selected": {
                  backgroundColor: "#b5aeae",
                },
                "&.MuiMenuItem-root:hover": {
                  backgroundColor: "#f0f0f0",
                },
              }}
            >
              {`Week of ${week.start} to ${week.end}`}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        {/* ROW 1 */}
        <Box
          gridColumn="span 12"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={`${(
              weeklyRevenue.reduce((acc, rev) => acc + rev, 0) * 1000
            ).toLocaleString("en-US", {
              maximumFractionDigits: 0,
            })} VND`}
            subtitle="Total of Week"
            icon={
              <PointOfSaleIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>

        {/* ROW 2 */}
        <Box
          gridColumn="span 12"
          display="grid"
          gridTemplateColumns="repeat(12, 1fr)"
          gridAutoRows="140px"
          gap="20px"
        >
          {/* ROW 1 */}
          {weeklyRevenue.map((revenue, index) => (
            <Box
              key={index}
              gridColumn="span 3"
              backgroundColor={colors.primary[400]}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <StatBox
                title={`${(revenue * 1000).toLocaleString("en-US", {
                  maximumFractionDigits: 0,
                })} VND`}
                subtitle={`Revenue for ${
                  getWeekDates(new Date(selectedWeek))[index]
                }`}
                icon={
                  <PointOfSaleIcon
                    sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                  />
                }
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
