import React, { useEffect, useState, useRef } from "react";
import { Box, Typography, useTheme,  Button, Modal } from "@mui/material";
import { tokens } from "../../../../theme";
import {
  mockTransactions,
  mockWithdrawData as initialMockWithdrawData,
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
import { getDatabase, ref, onValue, get, update } from "firebase/database";
import emailjs from 'emailjs-com';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RefundData = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const [totalFee, setTotalFee] = useState(0);
  const [totalFeeToday, setTotalFeeToday] = useState(0);
  const refundedRef = useRef(null);
  const cancelledRef = useRef(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [mockWithdrawData, setMockWithdrawData] = useState(initialMockWithdrawData);

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
    const sortedData = [...mockWithdrawData].sort((a, b) => {
      if (a.isRefund === b.isRefund) {
        return 0;
      }
      return a.isRefund ? 1 : -1;
    });

    setMockWithdrawData(sortedData);
  }, []);

  const handleGenerateQr = (request) => {
    const qrUrl = `https://img.vietqr.io/image/${request.bank}-${request.accountNumber}-print.png?amount=${request.amount * 1000}&addInfo=${request.username}`;

    setQrUrl(qrUrl);
    setQrModalOpen(true);
    console.log(request);
  };

  const formatDateToVN = (date) => {
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    };
    const formattedDate = new Date(date).toLocaleString('vi-VN', options);
    console.log('Formatted date:', formattedDate); // Debugging

    const datePartMatch = formattedDate.match(/(\d{2}\/\d{2}\/\d{4})/);
    const timePartMatch = formattedDate.match(/(\d{2}:\d{2}:\d{2})/);
    
    if (!datePartMatch || !timePartMatch) {
        console.error('Date or time part is undefined');
        return null;
    }

    const datePart = datePartMatch[0];
    const timePart = timePartMatch[0];

    console.log('Date part:', datePart); // Debugging
    console.log('Time part:', timePart); // Debugging

    const [day, month, year] = datePart.split('/');
    console.log('Day:', day, 'Month:', month, 'Year:', year); // Debugging

    if (!day || !month || !year) {
        console.error('Day, month, or year is undefined');
        return null;
    }

    return `${timePart} ${day}/${month}/${year}`;
};

const handleRefunded = async (request) => {
    const db = getDatabase();
    const refundMoneyRef = ref(db, `users/${request.userId}/refundMoney`);

    const snapshot = await get(refundMoneyRef);
    if (snapshot.exists()) {
        const refundMoney = snapshot.val();
        let refundKey = null;

        const formattedRequestDate = formatDateToVN(request.date);

        for (const key in refundMoney) {
            const formattedRefundDate = formatDateToVN(refundMoney[key].date);
            if (formattedRefundDate === formattedRequestDate) {
                refundKey = key;
                break;
            }
        }

        if (refundKey) {
            const specificRefundRef = ref(
                db,
                `users/${request.userId}/refundMoney/${refundKey}`
            );
            const now = new Date();
            const refundDay = formatDateToVN(now);

            await update(specificRefundRef, { isRefund: false, refundDay });

            const updatedWithdrawData = mockWithdrawData.map((r) =>
                formatDateToVN(r.date) === formattedRequestDate && !r.isRefund ? { ...r, isRefund: false, refundDay } : r
            );

            updatedWithdrawData.sort((a, b) => {
                if (a.isRefund === b.isRefund) {
                    return 0;
                }
                return a.isRefund ? 1 : -1;
            });

            setMockWithdrawData(updatedWithdrawData);

            try {
                const response = await axios.post('http://localhost:5000/send-email', {
                    user_email: request.mail,
                    user_name: request.username,
                    amount: request.amount,
                    request_date: formattedRequestDate,
                    refund_date: refundDay
                });
                toast.success('Email sent successfully');
            } catch (error) {
                console.error('Error sending email', error);
            }
        } else {
            console.error("Refund entry not found.");
        }
    } else {
        console.error("No refund money data found.");
    }
};

  const handleCloseModal = () => {
    setQrModalOpen(false);
    setQrUrl("");
  };


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
          gridRow="span 2"
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
                    request.status === "Processed"
                      ? colors.redAccent[500]
                      : colors.greenAccent[500]
                  }
                  fontSize={"2rem"}
                >
                 {request.isRefund ? "Refunded" : request.status === "Processed" ? "Processed" : "Pending"}
                </Typography>
              </Box>
              <Box
                flex=".5"
                textAlign="center"
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
              <Box
               flex="1">
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleGenerateQr(request)}
                  style={{ marginRight: "20px" }}
                  disabled={request.isRefund}
                >
                  Generate QR
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleRefunded(request)}
                  disabled={request.isRefund}
                >
                  Refunded
                </Button>
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
      </Box>
      <Modal open={qrModalOpen} onClose={handleCloseModal}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100vh"
        >
          <Box
            p="20px"
            backgroundColor="white"
            borderRadius="8px"
            boxShadow={3}
            display="flex"
            flexDirection="column"
            alignItems="center"
          >
            <Typography variant="h5" marginBottom="20px">
              QR Code
            </Typography>
            <img className="img-qr-code" src={qrUrl} alt="QR Code"/>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCloseModal}
              style={{ marginTop: "20px" }}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
      <ToastContainer/>
    </Box>
  );
};

export default RefundData;