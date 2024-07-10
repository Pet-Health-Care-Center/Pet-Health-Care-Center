import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth } from "../../Components/firebase/firebase";
import { fetchBookingDetails } from "../booking/fetchBooking"; // Ensure correct path
import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import { io } from "socket.io-client";

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const BookingDetails = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [medicalRecord, setMedicalRecord] = useState(null);
  const [cageHistory, setCageHistory] = useState([]);
  const user = auth.currentUser;
  const navigate = useNavigate();
  const [value, setValue] = useState(null);

  useEffect(() => {
    if (!user) {
      console.log("No user is currently logged in.");
      return;
    }

    const fetchData = async () => {
      try {
        const { booking, medicalRecord, cageHistory } = await fetchBookingDetails(user.uid, bookingId);
        setBooking(booking);
        setMedicalRecord(medicalRecord);
        setCageHistory(cageHistory);
        setValue(booking.rating);
      } catch (error) {
        console.error("Error fetching booking details:", error);
      }
    };
    fetchData();

    const socket = io('http://localhost:5000');

    socket.on('connect', () => {
      console.log('Socket.IO connection established');
    });

    socket.on('bookingUpdated', (data) => {
      if (data.bookingId === bookingId) {
        fetchData(); // Refetch the data to update the state
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO connection disconnected');
    });

    socket.on('error', (error) => {
      console.error('Socket.IO error:', error);
    });
    
    socket.on('bookingUpdated', (data) => {
      console.log('Booking updated:', data);
      // Handle the update here, e.g., update your state
    });
    return () => {
      socket.close();
    };
  }, [user, bookingId]);

  if (!booking) {
    return <p>Loading booking details...</p>;
  }

  const { pet, vet, date, time, services, totalPaid, status } = booking;
  const petName = pet?.name || "N/A";
  const vetName = vet?.name || "N/A";

  return (
    <div className="booking-details-wrapper">
      <div className="booking-details-container">
        <div className="left-panel">
          <img src={pet.imageUrl} alt="Pet Avatar" className="pet-avatar" />
          <div className="owner-info">
            <h3>Owner Information</h3>
            <p>Username: {user.displayName}</p>
            <p>Phone: {user.phoneNumber || "N/A"}</p>
            <p>Pet Name: {petName}</p>
          </div>
        </div>
        <div className="right-panel">
          <h2>Booking Details</h2>
          <table className="booking-details-table">
            <tbody>
              <tr>
                <td className="key-column">Booking ID</td>
                <td className="value-column">{booking.bookingId}</td>
              </tr>
              <tr>
                <td className="key-column">Date</td>
                <td className="value-column">{date}</td>
              </tr>
              <tr>
                <td className="key-column">Time</td>
                <td className="value-column">{time}</td>
              </tr>
              <tr>
                <td className="key-column">Services</td>
                <td className="value-column">{services.join(", ")}</td>
              </tr>
              <tr>
                <td className="key-column">Total Paid</td>
                <td className="value-column">${totalPaid}</td>
              </tr>
              <tr>
                <td className="key-column">Status</td>
                <td className="value-column">{status}</td>
              </tr>
              <tr>
                <td className="key-column">Vet</td>
                <td className="value-column">{vetName}</td>
              </tr>
              {value !== undefined && (
                <tr>
                  <td className="key-column">Rating</td>
                  <td className="value-column">
                    <Box
                      sx={{
                        width: 200,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        float: "right",
                      }}
                    >
                      <Rating
                        name="read-only"
                        value={value}
                        readOnly
                        sx={{
                          "& .MuiRating-iconFilled": {
                            color: "gold",
                          },
                        }}
                      />
                      <Box sx={{ ml: 2, fontSize: "2rem" }}>{value.toFixed(1)}</Box>
                    </Box>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {medicalRecord && (
            <div>
              <h2>Medical Record</h2>
              <table className="booking-details-table">
                <tbody>
                  {Object.entries(medicalRecord).map(([key, value]) => (
                    <tr key={key}>
                      <td className="key-column">{key}</td>
                      <td className="value-column">
                        {key === "cageRequired"
                          ? value
                            ? "True"
                            : "False"
                          : capitalizeFirstLetter(value.toString())}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
  {cageHistory && cageHistory.length > 0 && (
            <div>
              <h2>Cage History</h2>
              <div className="cage-history-container">
                <table className="booking-details-table">
                  <thead>
                    <tr>
                      <th className="key-column">Date</th>
                      <th className="key-column">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cageHistory.slice(0, 4).map((entry, index) => (
                      <tr key={index}>
                        <td className="value-column">{entry.date}</td>
                        <td className="value-column">{entry.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {cageHistory.length > 4 && (
                  <div className="scroll-container">
                    <table className="booking-details-table">
                      <tbody>
                        {cageHistory.slice(4).map((entry, index) => (
                          <tr key={index}>
                            <td className="value-column">{entry.date}</td>
                            <td className="value-column">{entry.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
          <button
            className="booking-detail back-button"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
          
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
