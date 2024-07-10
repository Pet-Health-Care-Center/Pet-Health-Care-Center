import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue, update, get } from "firebase/database";
import { Box, Typography, Button, Pagination } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../../../../theme";
import Header from "../../../../Components/dashboardChart/Header";
import ReportModal from "./reportModal"; // Adjust the import path as necessary
import { auth } from "../../../../Components/firebase/firebase";
import { useNavigate } from "react-router-dom";
import { fetchUserById } from "../../../account/getUserData";
import {
  fetchAllBookings,
  updateCageHistory,
} from "../../../booking/fetchAllBookingData";
const Booking = () => {
  const [cages, setCages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCageKey, setSelectedCageKey] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const rowsPerPage = 5;
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [userData, setUserData] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await fetchUserById(user.uid);
        console.log("Fetched user data:", userData);
        setUserData(userData);
      } catch (error) {
        setError(error.message);
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.uid) {
      fetchUserData();
    }
  }, [user]);

  useEffect(() => {
    const db = getDatabase();
    const cagesRef = ref(db, "cages");
    onValue(cagesRef, (snapshot) => {
      const data = snapshot.val();
      console.log("Cages data:", data); // Log the data

      if (data) {
        const cageList = Object.keys(data)
          .map((key) => ({
            key: key, // store the key here
            ...data[key],
            bookingId: data[key].pets?.[0]?.bookingId || "",
          }))
          .filter((cage) =>
            cage.pets?.some(
              (pet) =>
                pet.inCage &&
                pet.veterinarian &&
                pet.veterinarian.fullname === userData.fullname
            )
          );
        setCages(cageList);
      }
    });
  }, [userData.fullname]);
  const handleOpenModal = (cageKey, bookingId) => {
    setSelectedCageKey(cageKey);
    setIsModalOpen(true);
    setSelectedBookingId(bookingId);
    console.log(bookingId)
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCageKey(null);
  };

  const handleConfirmReport = async (description) => {
    if (!selectedCageKey) return;

    const db = getDatabase();
    const cageRef = ref(db, `cages/${selectedCageKey}`);
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 2);
    const formattedDate = currentDate.toLocaleDateString();

    try {
      const snapshot = await get(cageRef);
      if (snapshot.exists()) {
        const cageData = snapshot.val();
        const pets = cageData.pets || [];

        const petIndex = pets.findIndex((pet) => pet.inCage);
        if (petIndex !== -1) {
          const pet = pets[petIndex];
          const cageHistory = pet.cageHistory || [];

          const existingEntryIndex = cageHistory.findIndex(
            (entry) => entry.date === formattedDate
          );

          if (existingEntryIndex === -1) {
            cageHistory.push({ date: formattedDate, description });
          } else {
            cageHistory[existingEntryIndex].description = description;
          }

          pets[petIndex].cageHistory = cageHistory;

          await update(cageRef, { pets });

          const bookingsResponse = await fetchAllBookings();
          const bookings = bookingsResponse.bookings;

          const booking = bookings.find(
            (booking) => booking.bookingId === selectedBookingId
          );

          if (booking) {
            const bookingCageHistory = booking.cageHistory || [];

            const bookingExistingEntryIndex = bookingCageHistory.findIndex(
              (entry) => entry.date === formattedDate
            );

            if (bookingExistingEntryIndex === -1) {
              bookingCageHistory.push({ date: formattedDate, description });
            } else {
              bookingCageHistory[bookingExistingEntryIndex].description =
                description;
            }
            console.log(bookingCageHistory);
            await updateCageHistory(booking.bookingId, bookingCageHistory);
            handleCloseModal();
          } else {
            console.error(`Booking with ID ${selectedBookingId} not found.`);
            handleCloseModal();
          }
        } else {
          console.error("No pet currently in the cage.");
        }
      }
    } catch (error) {
      console.error(`Error updating cage ${selectedCageKey}:`, error);
      handleCloseModal();
    }
  };

  const columns = [
    {
      field: "id",
      headerName: (
        <Typography sx={{ fontSize: 18, fontWeight: "bold" }}>
          Cage ID
        </Typography>
      ),
      width: 150,
      editable: false,
      renderCell: ({ value }) => (
        <div style={{ fontSize: "16px" }}>{value}</div>
      ),
    },
    {
      field: "name",
      headerName: (
        <Typography sx={{ fontSize: 18, fontWeight: "bold" }}>
          Cage name
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
      field: "status",
      headerName: (
        <Typography sx={{ fontSize: 18, fontWeight: "bold" }}>
          Status
        </Typography>
      ),
      flex: 0.5,
      editable: false,
      renderCell: ({ value }) => (
        <div style={{ fontSize: "16px" }}>{value}</div>
      ),
    },
    {
      field: "veterinarian",
      headerName: (
        <Typography sx={{ fontSize: 18, fontWeight: "bold" }}>Vet</Typography>
      ),
      flex: 0.7,
      editable: false,
      renderCell: ({ row }) => {
        const vet =
          row.pets && row.pets.find((pet) => pet.inCage)?.veterinarian;
        return (
          <div style={{ fontSize: "16px" }}>
            {vet ? vet.fullname : "No Vet Assigned"}
          </div>
        );
      },
    },
    {
      field: "pets",
      headerName: (
        <Typography sx={{ fontSize: 18, fontWeight: "bold" }}>Pet</Typography>
      ),
      flex: 1.3,
      editable: false,
      renderCell: ({ value }) =>
        (value || [])
          .filter((pet) => pet.inCage)
          .map((pet) => (
            <div key={pet.petId} style={{ fontSize: "16px" }}>
              {pet.petName}
            </div>
          )),
    },
    {
      field: "petOwner",
      headerName: (
        <Typography sx={{ fontSize: 18, fontWeight: "bold" }}>Pet Owner</Typography>
      ),
      flex: 1.3,
      editable: false,
      renderCell: ({ value }) =>
        (value || [])
          .filter((pet) => pet.inCage)
          .map((pet) => (
            <div key={pet.petId} style={{ fontSize: "16px" }}>
              {pet.petOwner}
            </div>
          )),
    },
    {
      field: "report",
      headerName: (
        <Typography sx={{ fontSize: 18, fontWeight: "bold" }}>
          Report
        </Typography>
      ),
      flex: 0.5,
      renderCell: (params) => (
        <div className="admin-report-button">
          <Button
            variant="contained"
            size="small"
            onClick={() =>
              handleOpenModal(params.row.key, params.row.bookingId)
            }
            style={{
              marginRight: "10px",
              fontSize: "16px",
              backgroundColor: "green",
            }}
          >
            Report
          </Button>
        </div>
      ),
    },
  ];

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const displayedRows = cages.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <Box m="20px">
      <Header title="CAGES" subtitle="Managing Cages for pets" />
      <Box
        m="40px 0 0 0"
        height="40vh"
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
          "& .MuiSvgIcon-root": {
            fontSize: "20px",
          },
          "& .MuiSelect-select": {
            fontSize: "18px",
            marginRight: "60px",
            paddingRight: "20px",
          },
          "& .MuiInputBase-root": {
            width: "209px",
          },
        }}
      >
        <DataGrid rows={displayedRows} columns={columns} pagination={false} />
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
          count={Math.ceil(cages.length / rowsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
        />
      </Box>
      <ReportModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmReport}
      />
    </Box>
  );
};

export default Booking;
