import React, { useState, useEffect } from "react";
import { auth } from "../../Components/firebase/firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { Pagination } from "@mui/material";
import { makeStyles } from "@mui/styles";
import useForceUpdate from "../../hooks/useForceUpdate";
import "./ManageBookings.css";
import { fetchBookings, cancelBooking } from "./fetchBooking";
import moment from "moment";
import LoadingAnimation from "../../animation/loading-animation";

const useStyles = makeStyles({
  pagination: {
    display: "flex",
    justifyContent: "center",
    fontSize: "1.5rem",
    marginTop: "0",
    paddingBottom: "2rem",
    "& .MuiPaginationItem-root": {
      fontSize: "1.5rem",
      marginLeft: "2rem",
      padding: "4px",
      borderRadius: "50%",
      backgroundColor: "#7b2cbf",
      border: "1px solid var(--neon-color)",
      color: "#fff",
      transition: "all 0.3s ease",
      "&:hover": {
        backgroundColor: "#f0f0f0",
        borderColor: "#999",
        color: "#000",
      },
      "&.Mui-selected": {
        backgroundColor: "#be90e5",
        color: "#fff",
      },
    },
  },
});

const ManageBookings = () => {
  const [paidBookings, setPaidBookings] = useState([]);
  const [unpaidBookings, setUnpaidBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;
  const [confirmCancel, setConfirmCancel] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [bookingsPerPage] = useState(5);
  const navigate = useNavigate();
  const classes = useStyles();
  const forceUpdate = useForceUpdate();
  const [currentTab, setCurrentTab] = useState("Paid");

  useEffect(() => {
    if (!user) {
      console.log("No user is currently logged in.");
      return;
    }

    const fetchUserBookings = async () => {
      try {
        const { paidBookings, unpaidBookings } = await fetchBookings(user.uid);
        setPaidBookings(paidBookings);
        setUnpaidBookings(unpaidBookings);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setLoading(false);
      }
    };

    fetchUserBookings();
  }, [user]);

  const handleCancel = (booking) => {
    setConfirmCancel(booking);
  };

  const handleRating = (booking) => {
    navigate(`/rate-booking/${booking.key}`);
  };

  const confirmCancellation = async () => {
    if (confirmCancel) {
      const currentDate = new Date();
      const cancellationDate = currentDate.toDateString();
      console.log(cancellationDate);
      try {
        setLoading(true);
        const { key, vet, date, time, totalPaid } = confirmCancel;
        const userId = user.uid;
        const vetId = vet.uid;

        await cancelBooking({
          bookingKey: key,
          userId,
          vetId,
          date,
          time,
          totalPaid,
          cancellationDate,
        });

        setPaidBookings((prev) =>
          prev.map((booking) =>
            booking.key === confirmCancel.key
              ? { ...booking, status: "Cancelled" }
              : booking
          )
        );

        toast.success(
          "Cancelled successfully! Please check your booking section.",
          {
            autoClose: 2000,
            onClose: () => {
              setLoading(false); // Stop the loading state when toast closes
              forceUpdate();
            },
          }
        );

        setConfirmCancel(null);
      } catch (error) {
        console.error("Error cancelling booking:", error);
        toast.error(
          `An error occurred while processing the cancellation. Details: ${error.message}`
        );
        setLoading(false); // Stop the loading state in case of error
      }
    }
  };

  const closeModal = () => {
    setConfirmCancel(null);
  };
  const getCurrentBookings = () => {
    let allBookings = [...paidBookings, ...unpaidBookings];
        allBookings.sort((a, b) => new Date(b.date) - new Date(a.date));
    switch (currentTab) {
      case "Paid":
        return allBookings.filter((booking) => booking.status === "Paid");
      case "Checked-in":
        return allBookings.filter((booking) => booking.status === "Checked-in");
      case "Rated":
        return allBookings.filter((booking) => booking.status === "Rated");
      case "Cancelled":
        return allBookings.filter((booking) => booking.status === "Cancelled");
      case "Pending Payment":
        return allBookings.filter(
          (booking) => booking.status === "Pending Payment"
        );
      default:
        return allBookings;
    }
  };

  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;

  const currentBookings = getCurrentBookings().slice(
    indexOfFirstBooking,
    indexOfLastBooking
  );

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  useEffect(() => {
    const applyStyles = () => {
      document.querySelectorAll(".MuiPaginationItem-root").forEach((item) => {
        item.classList.add(classes.paginationItem);
      });
    };
    applyStyles();
  }, [currentPage, classes]);

  const getStatusClassName = (status) => {
    switch (status) {
      case "Paid":
        return "status-paid";
      case "Pending Payment":
        return "status-pending";
      case "Checked-in":
        return "status-checkedin";
      case "Cancelled":
        return "status-cancelled";
      case "Rated":
        return "status-rated";
      default:
        return "";
    }
  };
  const handleTabChange = (status) => {
    setCurrentTab(status);
    setCurrentPage(1); // Reset to the first page when changing tabs
  };

  return (
    <div className="manage-bookings-page">
      {loading && <LoadingAnimation />}
      <h2 className="manage-bookings-title">Manage Bookings</h2>
      <div className="tabs">
        <button
          className={`tab-button ${currentTab === "Paid" ? "active" : ""}`}
          onClick={() => handleTabChange("Paid")}
        >
          Paid
        </button>
        <button
          className={`tab-button ${
            currentTab === "Checked-in" ? "active" : ""
          }`}
          onClick={() => handleTabChange("Checked-in")}
        >
          Checked-in
        </button>
        <button
          className={`tab-button ${currentTab === "Rated" ? "active" : ""}`}
          onClick={() => handleTabChange("Rated")}
        >
          Rated
        </button>
        <button
          className={`tab-button ${currentTab === "Cancelled" ? "active" : ""}`}
          onClick={() => handleTabChange("Cancelled")}
        >
          Cancelled
        </button>
        <button
          className={`tab-button ${
            currentTab === "Pending Payment" ? "active" : ""
          }`}
          onClick={() => handleTabChange("Pending Payment")}
        >
          Pending
        </button>
      </div>

      <div className="bookings-section">
        <h3>{currentTab} Bookings</h3>
        {loading ? (
          <p>Loading {currentTab.toLowerCase()} bookings...</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Booking ID</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th className="action">Action</th>
                </tr>
              </thead>
              <tbody>
                {getCurrentBookings().length > 0 ? (
                  currentBookings.map((booking, index) => (
                    <tr
                      key={booking.key}
                      className={
                        booking.status === "Cancelled"
                          ? "cancelled-booking"
                          : ""
                      }
                      style={{
                        textDecoration:
                          booking.status === "Cancelled"
                            ? "line-through"
                            : "none",
                      }}
                    >
                      <td>{indexOfFirstBooking + index + 1}</td>
                      <td>{booking.bookingId}</td>
                      <td>{moment(booking.date).format("DD/MM/YYYY")}</td>
                      <td>{booking.time}</td>
                      <td
                        className={`status-cell ${getStatusClassName(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          className="detail-button"
                          onClick={() =>
                            navigate(`/booking-details/${booking.key}`)
                          }
                        >
                          Details
                        </button>
                        <button
                          className="cancel-button cancel-button-booking"
                          onClick={() => handleCancel(booking)}
                          disabled={
                            booking.status === "Cancelled" ||
                            booking.status === "Pending" ||
                            booking.status === "Rated" ||
                            booking.status === "Checked-in" ||
                            booking.status === "Pending Payment"
                          }
                        >
                          Cancel
                        </button>
                        <button
                          className="rate-button rate-button-booking"
                          onClick={() => handleRating(booking)}
                          disabled={
                            booking.status === "Cancelled" ||
                            booking.status === "Rated" ||
                            booking.status === "Pending Payment" ||
                            booking.status === "Paid"
                          }
                        >
                          Rate
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="no-data">
                    <td colSpan="6">
                      <div className="no-data-image">
                        <div className="ant-table-placeholder">
                          <div className="ant-table-cell">
                            <div className="css-kghr11 ant-empty ant-empty-normal">
                              <div className="ant-empty-image">
                                <svg
                                  width="64"
                                  height="41"
                                  viewBox="0 0 64 41"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <g
                                    transform="translate(0 1)"
                                    fill="none"
                                    fillRule="evenodd"
                                  >
                                    <ellipse
                                      fill="#f5f5f5"
                                      cx="32"
                                      cy="33"
                                      rx="32"
                                      ry="7"
                                    ></ellipse>
                                    <g fillRule="nonzero" stroke="#d9d9d9">
                                      <path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"></path>
                                      <path
                                        d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z"
                                        fill="#fafafa"
                                      ></path>
                                    </g>
                                  </g>
                                </svg>
                              </div>
                              <div className="ant-empty-description">
                                No data
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {getCurrentBookings().length > bookingsPerPage && (
              <>
                <div
                  style={{
                    textAlign: "center",
                    marginBottom: "1rem",
                    marginTop: "2rem",
                    fontSize: "2rem",
                  }}
                >
                  Page {currentPage} of{" "}
                  {Math.ceil(getCurrentBookings().length / bookingsPerPage)}
                </div>
                <Pagination
                  count={Math.ceil(
                    getCurrentBookings().length / bookingsPerPage
                  )}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  variant="outlined"
                  shape="rounded"
                  size="large"
                  className={classes.pagination}
                />
              </>
            )}
          </>
        )}
      </div>

      <ToastContainer autoClose={3000} />
      {confirmCancel && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Cancellation</h3>
              <span className="modal-close" onClick={closeModal}>
                &times;
              </span>
            </div>
            <p
              style={{ fontSize: "2rem", padding: "12px", lineHeight: "3rem" }}
            >
              This booking will be cancelled and we will return you 75% amount
              of this booking
            </p>
            <div className="modal-actions">
              <button className="confirm" onClick={confirmCancellation}>
                Yes
              </button>
              <button className="cancel" onClick={closeModal}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBookings;
