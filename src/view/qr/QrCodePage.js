import React, { useEffect, useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getDatabase, ref, get, update } from 'firebase/database';
import { auth } from '../../Components/firebase/firebase';
import { TransactionContext } from '../../Components/context/TransactionContext';
import { ToastContainer, toast } from 'react-toastify';
import { ScaleLoader } from "react-spinners"; // Import the spinner you want to use
import { css } from "@emotion/react"; 
import { updateProfile } from "firebase/auth";


const QrCodePage = () => {
  const location = useLocation();
  const { qrUrl, bookingId } = location.state;
  const navigate = useNavigate();
  const { fetchTransactions } = useContext(TransactionContext);
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(true); // Add this line

  const override = css`
    display: block;
    margin: 500px auto;
    border-color: red;
  `;
  

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const db = getDatabase();
        const userRef = ref(db, "users/" + user.uid);

        try {
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            const data = snapshot.val();
            setUsername(data.username);
          }
        } catch (error) {
          console.error("Error fetching user data: ", error);
        }
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    console.log("bookingId:", bookingId);
    console.log("user.uid:", user?.uid); // Use user?.uid to avoid error if user is undefined
  
    if (!username || !bookingId) return;
  
    const intervalId = setInterval(async () => {
      try {
        const { descriptions } = await fetchTransactions(); // Fetch transaction history
        const contentTransfer = `thanhtoan ${bookingId}`;
        console.log('Checking for payment description:', contentTransfer);
        console.log('Transaction descriptions:', descriptions);
        const isPaymentSuccessful = descriptions.some(description => {
          return description.includes(contentTransfer);
        });
  
        console.log('isPaymentSuccessful:', isPaymentSuccessful); // Log the value of isPaymentSuccessful
  
        if (isPaymentSuccessful) {
          // Update booking status to paid
          const user = auth.currentUser;
          console.log('Current user:', user);
          const db = getDatabase();
          const bookingRef = ref(db, `users/${user.uid}/bookings`);
          console.log('Booking ref:', bookingRef);
          const bookingSnapshot = await get(bookingRef);
          console.log("BookingSnapshot:",bookingSnapshot)
          const bookingData = bookingSnapshot.val();
          const bookingKeys = Object.keys(bookingData);
          let bookingKeyToUpdate;

          // Find the correct booking key
          for (const key of bookingKeys) {
            if (bookingData[key].bookingId === bookingId) {
              bookingKeyToUpdate = key;
              break;
            }
          }
          console.log(bookingKeyToUpdate)

          if (bookingKeyToUpdate) {
            // Update the paid status of the booking
            const updateRef = ref(db, `users/${user.uid}/bookings/${bookingKeyToUpdate}`);
            await update(updateRef, { paid: true });

            toast.success('Payment success! Please check your email to see your appointment information');
          } else {
            console.log('No booking data found for this bookingId');
          }
          toast.success('Payment success! Please check your email to see your appoitment information');
          clearInterval(intervalId);
          navigate('/');
        } else {
          console.log('Payment not found in transaction history');
        }
      } catch (error) {
        console.error('Error fetching transaction history:', error);
      } finally {
        setIsLoading(false); // Set isLoading to false after completing fetching data
      }
    }, 10000); // Check every 10 seconds
  
    return () => clearInterval(intervalId);
  }, [navigate, username, bookingId, fetchTransactions]);
  
  
  

  return (
    <div className="qr-code-page" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <h2 style={{paddingBottom: "20px", fontSize: "3rem"}}>Quét QR để thanh toán</h2>
    {isLoading ? (
      <ScaleLoader color={"#123abc"} loading={true} css={override} size={3000} /> // Display the spinner when isLoading is true
    ) : (
      <img style={{ width: "50%" }} src={qrUrl} alt="QR Code" />
    )}
  </div>
  );
};

export default QrCodePage;
