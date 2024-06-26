import React, { useEffect, useState, useMemo } from "react";
import { getDatabase, ref, get, update } from "firebase/database";
import { DataGrid } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Pagination,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import {
  tokens,
  themeSettings,
  ColorModeContext,
  useMode,
} from "../../../../theme";
import Header from "../../../../Components/dashboardChart/Header";
import "react-datepicker/dist/react-datepicker.css";
import Alert from "@mui/material/Alert";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import TextField from "@mui/material/TextField";
import dayjs from "dayjs";

const customThemeSettings = (mode) => {
  const baseTheme = themeSettings(mode);
  return {
    ...baseTheme,
    components: {
      MuiInputBase: {
        styleOverrides: {
          input: {
            fontSize: "20px",
          },
        },
      },
      MuiDatePicker: {
        styleOverrides: {
          root: {
            fontSize: "20px",
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            fontSize: "20px",
          },
        },
      },
      MuiSvgIcon: {
        styleOverrides: {
          root: {
            fontSize: "24px",
          },
        },
      },
      MuiPickersDay: {
        styleOverrides: {
          root: {
            fontSize: "20px",
          },
        },
      },
      MuiPickersYear: {
        styleOverrides: {
          yearButton: {
            fontSize: "14px",
            lineHeight: "0",
          },
        },
      },
      MuiDayCalendar: {
        styleOverrides: {
          weekDayLabel: {
            fontSize: "20px",
          },
        },
      },
      MuiPickersCalendarHeader: {
        styleOverrides: {
          label: {
            fontSize: "20px",
          },
        },
      },

      MuiPickersToolbarText: {
        styleOverrides: {
          toolbarTxt: {
            fontSize: "20px",
          },
        },
      },
    },
  };
};

const Dashboard = () => {
  const [theme, colorMode] = useMode(); // Sử dụng theme từ context
  const customTheme = useMemo(
    () => createTheme(customThemeSettings(theme.palette.mode)),
    [theme]
  );
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
        const userData = usersData[userId];
        if (userData.username && userData.bookings) {
          Object.keys(userData.bookings).forEach((bookingId) => {
            const booking = userData.bookings[bookingId];
            if (booking.status === "Paid") {
              const services = booking.services.join(", ");
              console.log(services);
              allBookings.push({
                id: bookingId,
                userId,
                username: userData.username,
                petName: booking.pet.name,
                vetName: booking.vet.name,
                services: services,
                date: dayjs(booking.date).format("DD/MM/YYYY"),
                time: booking.time,
                status: booking.status,
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
      console.log("Fetched Bookings:", allBookings);
      setBookings(allBookings);
      setLoading(false);
    };

    fetchBookings();
  }, []);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearchQuery = booking.id.toLowerCase().includes(searchQuery);
    const matchesSelectedDate = selectedDate
      ? dayjs(booking.date).format("DD-MM-YYYY") ===
        dayjs(selectedDate).format("DD-MM-YYYY")
      : true;
    console.log(matchesSelectedDate);
    console.log(selectedDate);
    console.log(booking.date);
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
      await update(
        ref(getDatabase(), `users/${row.userId}/bookings/${row.id}`),
        {
          status: "Cancelled",
        }
      );

      setBookings(
        bookings.map((item) =>
          item.id === row.id ? { ...item, status: "Cancelled" } : item
        )
      );
    } catch (error) {
      console.error("Error canceling booking:", error);
    }

    setLoading(false);
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
          Pet Name
        </Typography>
      ),
      flex: 0.5,
      editable: false,
      width: 150,
      renderCell: ({ value }) => (
        <div style={{ fontSize: "16px" }}>{value}</div>
      ),
    },
    {
      field: "vetName",
      headerName: (
        <Typography sx={{ fontSize: 18, fontWeight: "bold" }}>
          Vet Name
        </Typography>
      ),
      flex: 0.5,
      editable: false,
      renderCell: ({ value }) => (
        <div style={{ fontSize: "16px" }}>{value}</div>
      ),
    },
    {
      field: "username",
      headerName: (
        <Typography sx={{ fontSize: 18, fontWeight: "bold" }}>
          User Name
        </Typography>
      ),
      flex: 0.7,
      editable: false,
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
        <Typography
          mt={2}
          fontSize={"1.4rem"}
          style={{ whiteSpace: "pre-line" }}
        >
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
      flex: 0.7,
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
      editable: false,
      renderCell: ({ value }) => (
        <Typography
          mt={2}
          fontSize={"1.4rem"}
          style={{ whiteSpace: "pre-line" }}
        >
          {value}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: (
        <Typography sx={{ fontSize: 18, fontWeight: "bold" }}>
          Actions
        </Typography>
      ),
      flex: 1,
      renderCell: (params) => (
        <div className="admin-update-button">
          <Button
            variant="contained"
            style={{
              marginRight: "10px",
              fontSize: "16px",
              backgroundColor: "red",
            }}
            onClick={() => handleCancelBooking(params.row)}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            size="small"
            style={{
              marginRight: "10px",
              fontSize: "16px",
              backgroundColor: "green",
            }}
            onClick={() => handleCheckinBooking(params.row)}
          >
            Check-in
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
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={customTheme}>
        <Box m="20px">
          <Header title="Dashboard" subtitle="All Paid Bookings" />
          <Box
            display="flex"
            backgroundColor={colors.primary[400]}
            borderRadius="3px"
            width={300}
          >
            <InputBase
              sx={{ ml: 2, flex: 1, fontSize: "20px" }}
              placeholder="Search by email"
              value={searchQuery}
              onChange={handleSearch}
            />
            <IconButton type="button" sx={{ p: 1 }}>
              <SearchIcon sx={{ fontSize: "20px" }} />
            </IconButton>
          </Box>

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
                clearable
                onClear={handleClear}
                sx={{
                  width: 260,
                }}
                renderInput={(params) => <TextField {...params} />}
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
              "& .MuiDataGrid-overlay": {
                fontSize: "24px",
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
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default Dashboard;
