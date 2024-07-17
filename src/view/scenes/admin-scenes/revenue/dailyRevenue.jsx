import React, { useEffect, useState } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../../../../theme";
import { mockTransactions, mockDataTeam } from "../../../data/mockData";
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

  const [dailyRevenue, setDailyRevenue] = useState(0);
  const [dailyRevenueChange, setDailyRevenueChange] = useState("0%");
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [isCustomDateSelected, setIsCustomDateSelected] = useState(false);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getTotalPaid = (date, type) => {
    let totalPaid = 0;
    let currentYear = new Date().getFullYear();

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
        let formattedDate = `${currentYear}-${month}-${day}`;

        let bookingTotalPaid = booking.totalPaid || 0;

        if (booking.status === "Cancelled") {
          bookingTotalPaid *= 0.25;
        }

        if (type === "date" && date === formattedDate) {
          totalPaid += bookingTotalPaid;
        }
      }
    });

    return totalPaid;
  };

  const getPreviousDay = () => {
    const currentDate = new Date();
    const previousDay = new Date(
      currentDate.setDate(currentDate.getDate() - 1)
    );
    const year = previousDay.getFullYear();
    const month = String(previousDay.getMonth() + 1).padStart(2, "0");
    const day = String(previousDay.getDate()).padStart(2, "0");
    return { year, month, day, previousDay: `${year}-${month}-${day}` };
  };

  const formatTransactionDate = (dateString) => {
    const date = new Date(dateString);
    return formatDate(date);
  };

  useEffect(() => {
    const updateRevenue = () => {
      const currentDate = getCurrentDate();
      if (isCustomDateSelected && selectedDate !== currentDate) {
        const totalPaidForSelectedDate = getTotalPaid(selectedDate, "date");
        setDailyRevenue(totalPaidForSelectedDate);
        return;
      }

      const previousDay = getPreviousDay();

      const totalPaidForDate = getTotalPaid(currentDate, "date");
      const totalPaidForPreviousDay = getTotalPaid(
        previousDay.previousDay,
        "date"
      );
      setDailyRevenue(totalPaidForDate);

      const dailyPercentageChange =
        totalPaidForPreviousDay === 0
          ? "N/A"
          : ((totalPaidForDate - totalPaidForPreviousDay) /
              totalPaidForPreviousDay) *
            100;
      setDailyRevenueChange(
        totalPaidForPreviousDay === 0
          ? "N/A"
          : `${dailyPercentageChange.toFixed(2)}%`
      );
    };

    updateRevenue();

    const intervalId = setInterval(updateRevenue, 1000);

    return () => clearInterval(intervalId);
  }, [isCustomDateSelected, selectedDate]);

  useEffect(() => {
    if (selectedDate) {
      if (selectedDate === getCurrentDate()) {
        setIsCustomDateSelected(false);
      } else {
        setIsCustomDateSelected(true);
      }
    } else {
      setIsCustomDateSelected(false);
    }
  }, [selectedDate]);

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const filteredTransactions = mockTransactions.filter(
    (transaction) =>
      formatTransactionDate(transaction.formattedDate) === selectedDate
  );

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
      </Box>
      <div className="date-filter-container">
        <h1>Filter by day:</h1>
        <input
          className="date-Filter-Revenue"
          type="date"
          onChange={handleDateChange}
          value={selectedDate}
        ></input>
      </div>
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
            title={`${(dailyRevenue * 1000).toLocaleString("en-US", {
              maximumFractionDigits: 0,
            })} VND`}
            subtitle="Daily Revenue"
            icon={
              <PointOfSaleIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>

        {/* ROW 2 */}

        {/* ROW 3 */}

        <Box
          gridColumn="span 12"
          gridRow="span 3"
          backgroundColor={colors.primary[400]}
          overflow="auto"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${colors.primary[500]}`}
            colors={colors.grey[100]}
            p="15px"
            position="sticky"
            top="0"
            backgroundColor={colors.primary[400]}
          >
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              Recent Transactions
            </Typography>
          </Box>
          {filteredTransactions.length === 0 ? (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              p="180px"
            >
              <Typography
                color={colors.grey[100]}
                variant="h6"
                fontWeight="700"
                fontSize="20px"
              >
                None transaction on {selectedDate}
              </Typography>
            </Box>
          ) : (
            filteredTransactions.map((transaction, i) => (
              <Box
                key={`${transaction.bookingId}-${i}`}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                borderBottom={`4px solid ${colors.primary[500]}`}
                p="15px"
              >
                <Box flex="1">
                  <Typography
                    color={colors.greenAccent[500]}
                    variant="h5"
                    fontWeight="600"
                    fontSize={"2rem"}
                  >
                    {transaction.bookingID}
                  </Typography>
                  <Typography color={colors.grey[100]} fontSize={"2rem"}>
                    {transaction.user}
                  </Typography>
                </Box>
                <Box flex="1" textAlign="center">
                  <Typography color={colors.grey[100]} fontSize={"2rem"}>
                    {transaction.time + " " + transaction.date}
                  </Typography>
                </Box>
                <Box flex="1" textAlign="center">
                  <Typography
                    color={
                      transaction.status === "Checked-in"
                        ? colors.blueAccent[500]
                        : transaction.status === "Rated"
                        ? "yellow"
                        : transaction.status === "Pending Payment"
                        ? "rgb(255, 219, 194)"
                        : transaction.status === "Cancelled"
                        ? colors.redAccent[500]
                        : colors.greenAccent[500]
                    }
                    fontSize={"2rem"}
                  >
                    {transaction.status}
                  </Typography>
                </Box>
                <Box
                  flex=".5"
                  textAlign="center"
                  backgroundColor={colors.greenAccent[500]}
                  p="5px 5px"
                  borderRadius="4px"
                  fontSize={"2rem"}
                >
                  {`${(transaction.cost * 1000).toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })} VND`}
                </Box>
              </Box>
            ))
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
