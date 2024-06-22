import React, { useEffect, useState, useRef } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../../../../theme";
import {
  mockTransactions,
  mockDataTeam,
  mockWithdrawData,
} from "../../../data/mockData";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import TrafficIcon from "@mui/icons-material/Traffic";
import Header from "../../../../Components/dashboardChart/Header";
import LineChart from "../../../../Components/dashboardChart/LineChart";
import BarChart from "../../../../Components/dashboardChart/BarChart";
import StatBox from "../../../../Components/dashboardChart/StatBox";
import PieChart from "../../../../Components/dashboardChart/PieChart";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

const RefundData = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const [totalFee, setTotalFee] = useState(0);
  const [totalFeeToday, setTotalFeeToday] = useState(0);
  const refundedRef = useRef(null);
  const cancelledRef = useRef(null);

  // const formatNumber = (number) => {
  //   return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  // };

  const handleScrollSync = (scrollingRef, targetRef) => {
    if (scrollingRef.current && targetRef.current) {
      const scrollTop = scrollingRef.current.scrollTop;
      targetRef.current.scrollTop = scrollTop;
    }
  };

  useEffect(() => {
    const calculateTotals = () => {
      const totalFeeSum = mockTransactions
        .filter((transaction) => transaction.status === "Cancelled")
        .reduce(
          (sum, transaction) => sum + (transaction.feeOfCancellation || 0),
          0
        );

      const totalWithdrawnSum = mockWithdrawData
        .filter((request) => request.status === "Processed")
        .reduce((sum, request) => sum + request.amount, 0);

      const totalFeeTodaySum = mockTransactions
        .filter((transaction) => {
          const [day, month, year] = transaction.date.split("-");
          const transactionDate = new Date(year, parseInt(month) - 1, day);
          const currentDate = new Date();
          return (
            transaction.status === "Cancelled" &&
            transactionDate.toDateString() === currentDate.toDateString()
          );
        })
        .reduce(
          (sum, transaction) => sum + (transaction.feeOfCancellation || 0),
          0
        );

      setTotalFee(totalFeeSum);
      setTotalWithdrawn(totalWithdrawnSum);
      setTotalFeeToday(totalFeeTodaySum);
    };

    calculateTotals();
  }, [mockTransactions, mockWithdrawData]);

  useEffect(() => {
    const handleRefundedScroll = () => {
      handleScrollSync(refundedRef, cancelledRef);
    };

    const handleCancelledScroll = () => {
      handleScrollSync(cancelledRef, refundedRef);
    };

    if (refundedRef.current) {
      refundedRef.current.addEventListener("scroll", handleRefundedScroll);
    }

    if (cancelledRef.current) {
      cancelledRef.current.addEventListener("scroll", handleCancelledScroll);
    }

    return () => {
      if (refundedRef.current) {
        refundedRef.current.removeEventListener("scroll", handleRefundedScroll);
      }

      if (cancelledRef.current) {
        cancelledRef.current.removeEventListener(
          "scroll",
          handleCancelledScroll
        );
      }
    };
  }, []);

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
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
          gridColumn="span 4"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={`${(totalFeeToday * 1000).toLocaleString("en-US", {
              maximumFractionDigits: 0,
            })} VND`}
            subtitle="Fee Today"
            progress="null"
            icon={<AttachMoneyIcon />}
          />
        </Box>

        <Box
          gridColumn="span 4"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={`${(totalWithdrawn * 1000).toLocaleString("en-US", {
              maximumFractionDigits: 0,
            })} VND`}
            subtitle="Total withdrawn"
            progress="null"
            icon={<CurrencyExchangeIcon />}
          />
        </Box>

        <Box
          gridColumn="span 4"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={`${(totalFee * 1000).toLocaleString("en-US", {
              maximumFractionDigits: 0,
            })} VND`}
            subtitle="Total of Fee"
            progress="null"
            icon={<AttachMoneyIcon />}
          />
        </Box>

        {/* ROW 2 */}

        <Box
          gridColumn="span 12"
          gridRow="span 2 "
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
              Withdraw Request
            </Typography>
          </Box>
          {mockWithdrawData.map((request, i) => (
            <Box
              key={`${request.accountNumber}-${i}`}
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
                  {request.accountNumber}
                </Typography>
                <Typography color={colors.grey[100]} fontSize={"2rem"}>
                  {request.bank}
                </Typography>
              </Box>
              <Box flex="1" textAlign="center">
                <Typography color={colors.grey[100]} fontSize={"2rem"}>
                  {request.date}
                </Typography>
              </Box>
              <Box flex="1" textAlign="center">
                <Typography
                  color={
                    request.isRefund
                      ? colors.redAccent[500]
                      : colors.greenAccent[500]
                  }
                  fontSize={"2rem"}
                >
                  {request.isRefund ? "Processed" : "Pending"}
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
                {request.amount || 0
                  ? `${(request.amount * 1000).toLocaleString("en-US", {
                      maximumFractionDigits: 0,
                    })} VND`
                  : "0 VND"}
              </Box>
            </Box>
          ))}
        </Box>

        {/* ROW 3 */}

        <Box
          gridColumn="span 6"
          gridRow="span 2 "
          backgroundColor={colors.primary[400]}
          overflow="auto"
          ref={refundedRef}
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
              Recent Refunded
            </Typography>
          </Box>
          {mockTransactions
            .filter((transaction) => transaction.status == "Cancelled")
            .map((transaction, i) => (
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
                      transaction.status === "Cancelled"
                        ? colors.blueAccent[500]
                        : colors.greenAccent[500]
                    }
                    fontSize={"2rem"}
                  >
                    {transaction.status === "Cancelled"
                      ? "Fee"
                      : transaction.status}
                  </Typography>
                </Box>
                <Box
                  flex=".5"
                  textAlign="center"
                  backgroundColor={colors.greenAccent[500]}
                  p="5px 5px"
                  borderRadius="4px"
                  fontSize={"1.8rem"}
                >
                  {transaction.feeOfCancellation || 0
                    ? `${(transaction.feeOfCancellation * 1000).toLocaleString(
                        "en-US",
                        { maximumFractionDigits: 0 }
                      )} VND`
                    : "0 VND"}
                </Box>
              </Box>
            ))}
        </Box>

        <Box
          gridColumn="span 6"
          gridRow="span 2 "
          backgroundColor={colors.primary[400]}
          overflow="auto"
          ref={cancelledRef}
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
              Recent Cancelled
            </Typography>
          </Box>
          {mockTransactions
            .filter((transaction) => transaction.status == "Cancelled")
            .map((transaction, i) => (
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
                      transaction.status === "Cancelled"
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
                  fontSize={"1.8rem"}
                >
                  {transaction.cost || 0
                    ? `${(transaction.cost * 1000).toLocaleString("en-US", {
                        maximumFractionDigits: 0,
                      })} VND`
                    : "0 VND"}
                </Box>
              </Box>
            ))}
        </Box>

        {/* <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          padding="30px"
        ></Box> */}
      </Box>
    </Box>
  );
};

export default RefundData;
