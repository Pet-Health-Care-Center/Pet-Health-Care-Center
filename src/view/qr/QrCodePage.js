import React, { useEffect, useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getDatabase, ref, get, update, onValue, set } from "firebase/database";
import { auth } from "../../Components/firebase/firebase";
import { TransactionContext } from "../../Components/context/TransactionContext";
import { ToastContainer, toast } from "react-toastify";
import { ScaleLoader } from "react-spinners";
import { css } from "@emotion/react";
import useForceUpdate from "../../hooks/useForceUpdate";
import { BookingContext } from "../../Components/context/BookingContext";
import { fetchUserById } from "../account/getUserData";
import { updateUserBooking } from "../../Components/transaction/fetchTransaction";

const QrCodePage = () => {
  const { selectedPet, selectedServices, selectedDateTime } =
    useContext(BookingContext);
  const location = useLocation();
  const { qrUrl, bookingId } = location.state;
  const navigate = useNavigate();
  const { fetchTransactions } = useContext(TransactionContext);
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [accountBalance, setAccountBalance] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const forceUpdate = useForceUpdate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const user = auth.currentUser
  const userId = user.uid
  console.log(userId)

  const override = css`
    display: block;
    margin: 500px auto;
    border-color: red;
  `;

  const mockFetchTransactions = async () => {
    return {
      descriptions: [
        "thanhtoan BK1243463456",
        "thanhtoan BK12315234",
        "thanhtoan BK12315234",
        "thanhtoan BK12315234",
        "thanhtoan " + bookingId,
        "thanhtoan BK12315234",
        "thanhtoan BK12315234",
      ],
      amounts: [0, 1000, 100, 100, 120000, 500, 50000, 120000],
    };
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true); // Start loading indicator
        const userData = await fetchUserById(user.uid);
        console.log('Fetched user data:', userData);
  
        if (userData) {
          setUsername(userData.username);
          setAccountBalance(userData.accountBalance || 0);
          if (userData.bookings) {
            const booking = Object.values(userData.bookings).find(
              (b) => b.bookingId === bookingId
            );
            if (booking) {
              setTotalPaid(booking.totalPaid);
            }
          }
        }
      } catch (error) {
        setError(error.message);
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false); // Stop loading indicator
      }
    };
  
    if (user && user.uid) {
      fetchUserData();
    }
  }, [user, bookingId]);

  useEffect(() => {
    const user = auth.currentUser;
  
    if (!username || !bookingId) return;
  
    const intervalId = setInterval(async () => {
      try {
        const { descriptions, amounts } = await mockFetchTransactions();
        const contentTransfer = `thanhtoan ${bookingId}`;
  
        const paymentIndex = descriptions.findIndex((description) =>
          description.includes(contentTransfer)
        );
  
        console.log("Descriptions:", descriptions);
        console.log("Amounts:", amounts);
        console.log("Payment Index:", paymentIndex);
  
        if (paymentIndex !== -1) {
          const paymentAmount = amounts[paymentIndex];
          const paymentAmountInSystem = paymentAmount / 1000;
  
          const updateData = {
            uid: user.uid,
            bookingId,
            paymentAmountInSystem,
            totalPaid,
            selectedDateTime,
            selectedPet,
            selectedServices,
            username,
            userId,
          };
  
          await updateUserBooking(updateData);
  
          toast.success(
            "Payment successfully! Please your check booking section.",
            {
              autoClose: 2000,
              onClose: () => {
                setTimeout(() => {
                  forceUpdate();
                  navigate("/manage-booking");
                }, 500);
              },
            }
          );
  
          clearInterval(intervalId);
        } else {
          console.log("Payment not found in transaction history");
        }
      } catch (error) {
        console.error("Error fetching transaction history:", error);
      } finally {
        setIsLoading(false);
      }
    }, 10000); // Check every 10 seconds
  
    return () => clearInterval(intervalId);
  }, [navigate, username, bookingId, fetchTransactions, totalPaid]);
  

  return (
    <div
      className="qr-code-page"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <h2
        style={{ marginTop: "30px", paddingBottom: "20px", fontSize: "3rem" }}
      >
        Quét QR để thanh toán
      </h2>
      {isLoading ? (
        <ScaleLoader
          color={"#123abc"}
          loading={true}
          css={override}
          height={35}
          width={4}
          radius={2}
          margin={2}
          speedMultiplier={2}
        />
      ) : (
        <img src={qrUrl} alt="QR Code" />
      )}
      <ToastContainer />
    </div>
  );
};

export default QrCodePage;
