import React, { useEffect, useState } from "react";
import { getDatabase, ref, get, update } from "firebase/database";
import { DataGrid } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";
import {
  Box,
  Typography,
  useTheme,
  Button,
  IconButton,
  Pagination,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import { tokens, darkTheme } from "../../../../theme";
import Header from "../../../../Components/dashboardChart/Header";
import "react-datepicker/dist/react-datepicker.css";
import Alert from "@mui/material/Alert";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import TextField from "@mui/material/TextField";
import dayjs from "dayjs";
import axios from "axios";

const ManageBooking = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const today = dayjs();
  const [selectedDate, setSelectedDate] = useState(today);
  const [cleared, setCleared] = React.useState(false);

  const fetchAllBookings = async () => {
    const db = getDatabase();
    const usersRef = ref(db, "users");
    const snapshot = await get(usersRef);
    const usersData = snapshot.val();
    let allBookings = [];

    if (usersData) {
      Object.keys(usersData).forEach((userId) => {
        console.log(userId);
        const userData = usersData[userId];
        if (userData.username && userData.bookings) {
          Object.keys(userData.bookings).forEach((bookingId) => {
            const booking = userData.bookings[bookingId];
            if (["Paid", "Checked-in", "Rated"].includes(booking.status)) {
              const services = booking.services.join(", ");
              allBookings.push({
                id: bookingId,
                userId,
                username: userData.username,
                email: userData.email,
                petName: booking.pet.name,
                vetName: booking.vet.name,
                services: services,
                date: dayjs(booking.date).format("DD/MM/YYYY"),
                time: booking.time,
                status: booking.status,
                accountBalance: userData.accountBalance,
                totalPaid: booking.totalPaid,
                ...booking,
              });
            }
          });
        }
      });
    }

    return allBookings;
  };

  useEffect(() => {
    const fetchBookings = async () => {
      const allBookings = await fetchAllBookings();
      setBookings(allBookings);
      setLoading(false);
    };

    fetchBookings();
  }, []);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearchQuery = booking.id.toLowerCase().includes(searchQuery);
    const matchesSelectedDate = selectedDate
      ? dayjs(booking.date).format("DD-MM-YYYY") ===
        dayjs(selectedDate).format("DD-MM-YYYY")
      : true;
    return matchesSearchQuery && matchesSelectedDate;
  });

  const handleDateChange = (date) => {
    setSelectedDate(date);
    console.log(date);
  };
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const displayedBookings = filteredBookings.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleCancelBooking = async (row) => {
    setLoading(true);

    try {
      const db = getDatabase();

      // Update booking status in Firebase
      await update(ref(db, `users/${row.userId}/bookings/${row.id}`), {
        status: "Cancelled",
      });
      await update(ref(db, `users/${row.userId}`), {
        accountBalance: row.accountBalance + row.totalPaid,
      });

      // Send cancellation email
      try {
        const response = await axios.post(
          "http://localhost:5000/send-cancellation-email",
          {
            user_email: row.email,
            user_name: row.username,
            booking_id: row.bookingId,
            cancel_date: new Date().toLocaleDateString(), // Use appropriate date format
          }
        );

        console.log(response.data); // Log the success message
      } catch (emailError) {
        console.error("Error sending cancellation email:", emailError.message);
      }

      // Update local bookings state
      setBookings((bookings) =>
        bookings.map((item) =>
          item.id === row.id ? { ...item, status: "Cancelled" } : item
        )
      );
    } catch (error) {
      console.error("Error cancelling booking:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckinBooking = async (row) => {
    setLoading(true);

    try {
      await update(
        ref(getDatabase(), `users/${row.userId}/bookings/${row.id}`),
        {
          status: "Checked-in",
        }
      );

      setBookings(
        bookings.map((item) =>
          item.id === row.id ? { ...item, status: "Checked-in" } : item
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }

    setLoading(false);
  };

  const columns = [
    {
      field: "bookingId",
      headerName: (
        <Typography sx={{ fontSize: 18, fontWeight: "bold" }}>
          Booking ID
        </Typography>
      ),
      width: 150,
      editable: false,
      renderCell: ({ value }) => (
        <div style={{ fontSize: "16px" }}>{value}</div>
      ),
    },
    {
      field: "petName",
      headerName: (
        <Typography sx={{ fontSize: 18, fontWeight: "bold" }}>
          Pet name
        </Typography>
      ),
      flex: 0.6,
      editable: true,
      renderCell: ({ value }) => (
        <div style={{ fontSize: "16px" }}>{value}</div>
      ),
    },
    {
      field: "vetName",
      headerName: (
        <Typography sx={{ fontSize: 18, fontWeight: "bold" }}>
          Vet name
        </Typography>
      ),
      flex: 0.5,
      editable: true,
      renderCell: ({ value }) => (
        <div style={{ fontSize: "16px" }}>{value}</div>
      ),
    },
    {
      field: "username",
      headerName: (
        <Typography sx={{ fontSize: 18, fontWeight: "bold" }}>
          Username
        </Typography>
      ),
      flex: 0.7,
      editable: true,
      renderCell: ({ value }) => (
        <div style={{ fontSize: "16px" }}>{value}</div>
      ),
    },
    {
      field: "services",
      headerName: (
        <Typography sx={{ fontSize: 18, fontWeight: "bold" }}>
          Services
        </Typography>
      ),
      flex: 1.3,
      editable: false,
      renderCell: ({ value }) => (
        <Typography mt={2} fontSize={"16px"} style={{ whiteSpace: "pre-line" }}>
          {value.join(", ")}
        </Typography>
      ),
    },

    {
      field: "date",
      headerName: (
        <Typography sx={{ fontSize: 18, fontWeight: "bold" }}>Date</Typography>
      ),
      flex: 0.7,
      editable: false,
      renderCell: ({ value }) => (
        <div style={{ fontSize: "16px" }}>{value}</div>
      ),
    },
    {
      field: "time",
      headerName: (
        <Typography sx={{ fontSize: 18, fontWeight: "bold" }}>Time</Typography>
      ),
      flex: 0.5,
      editable: false,
      renderCell: ({ value }) => (
        <div style={{ fontSize: "16px" }}>{value}</div>
      ),
    },
    {
      field: "status",
      headerName: (
        <Typography sx={{ fontSize: 18, fontWeight: "bold" }}>
          Status
        </Typography>
      ),
      flex: 0.5,
      renderCell: ({ value }) => (
        <Typography
          color={value === "Pending Payment" ? "orange" : "green"}
          sx={{ fontSize: "16px", marginTop: "12px", fontWeight: "bold" }}
        >
          {value}
        </Typography>
      ),
    },
    {
      field: "action",
      headerName: (
        <Typography sx={{ fontSize: 18, fontWeight: "bold" }}>
          Action
        </Typography>
      ),
      flex: 1,
      renderCell: (params) => (
        <div className="admin-update-button">
          <Button
            variant="contained"
            size="small"
            style={{
              marginRight: "10px",
              fontSize: "16px",
              backgroundColor: "green",
            }}
            disabled={["Checked-in", "Rated"].includes(params.row.status)}
            onClick={() => handleCheckinBooking(params.row)}
          >
            Check-in
          </Button>

          <Button
            variant="contained"
            size="small"
            style={{
              marginRight: "10px",
              fontSize: "16px",
              backgroundColor: "red",
            }}
            onClick={() => handleCancelBooking(params.row)}
          >
            Cancel
          </Button>
        </div>
      ),
    },
  ];

  const handleClear = () => {
    setSelectedDate(null);
    setCleared(true);
  };

  return (
    <Box m="20px">
      <Header title="BOOKINGS" subtitle="Manage the Bookings" />
      <Box
        display="flex"
        backgroundColor={colors.primary[400]}
        borderRadius="3px"
        width={300}
      >
        <InputBase
          sx={{ ml: 2, flex: 1, fontSize: "20px" }}
          placeholder="Search by Booking ID"
          value={searchQuery}
          onChange={handleSearch}
        />
        <IconButton type="button" sx={{ p: 1 }}>
          <SearchIcon sx={{ fontSize: "20px" }} />
        </IconButton>
      </Box>
      <ThemeProvider theme={darkTheme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <DatePicker
            value={selectedDate}
            onChange={handleDateChange}
            inputFormat="DD/MM/YYYY" // Định dạng hiển thị ngày
            clearable
            onClear={handleClear}
            sx={{ width: 320 }}
            renderInput={(params) => (
              <TextField
                {...params}
                InputProps={{
                  style: { fontSize: "16px", color: "#ffffff" }, // Tùy chỉnh kích thước font và màu chữ cho input
                }}
                sx={{
                  "& .MuiInputBase-root": {
                    backgroundColor: "#424242", // Nền tối cho input
                  },
                  "& .MuiInputBase-input": {
                    fontSize: "24px", // Tùy chỉnh kích thước font cho input
                  },
                }}
              />
            )}
          />
          {cleared && (
            <Alert
              sx={{ position: "absolute", bottom: 0, right: 0 }}
              severity="success"
            >
              Field cleared!
            </Alert>
          )}
        </Box>
      </LocalizationProvider>
    </ThemeProvider>

      <Box
        m="40px 0 0 0"
        height="45vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            display: "none",
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
        <DataGrid
          rows={displayedBookings}
          columns={columns}
          pagination={false}
        />
      </Box>
      <Box
        mt="20px"
        display="flex"
        justifyContent="center"
        sx={{
          "& .MuiPagination-root": {
            backgroundColor: colors.primary[400],
            borderRadius: "4px",
            padding: "10px",
          },
          "& .MuiPaginationItem-root": {
            fontSize: "1.2rem",
          },
        }}
      >
        <Pagination
          count={Math.ceil(filteredBookings.length / rowsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default ManageBooking;