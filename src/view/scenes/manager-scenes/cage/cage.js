import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue, update, get } from "firebase/database";
import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";

import {
  Box,
  useTheme,
  IconButton,
  Button,
  MenuItem,
  Typography,
  Pagination,
  Select,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../../../theme";
import Header from "../../../../Components/dashboardChart/Header";
import {
  getCages,
  addNewCage,
  addNewService,
  getCageByKey,
  updateCageByKey,
} from "../../admin-scenes/services and cages/getServiceNCageData";
import { getAllUsers } from "../../../account/getUserData";

const RoleEditCell = ({ id, value, api, vets, handleVetChange }) => {
  const [selectedVetId, setSelectedVetId] = useState(value ? value.id : "");

  const handleChange = (event) => {
    const vetId = event.target.value;
    const selectedVet = vets.find((vet) => vet.id === vetId);
    setSelectedVetId(vetId);
    handleVetChange(id, selectedVet);
    api.setEditCellValue({
      id: id,
      field: "veterinarian",
      value: selectedVet.fullname,
    });
  };

  return (
    <div className="role-menu">
      <Select value={selectedVetId} onChange={handleChange} autoFocus fullWidth>
        {vets.map((vet) => (
          <MenuItem key={vet.id} sx={{ fontSize: "16px" }} value={vet.id}>
            {vet.fullname}
          </MenuItem>
        ))}
      </Select>
    </div>
  );
};

const Cage = () => {
  const [cages, setCages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vets, setVets] = useState([]);
  const [selectedVets, setSelectedVets] = useState({});
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cagesData = await getCages();
        // console.log(cagesData);

        if (cagesData) {
          const cageList = Object.keys(cagesData).map((key) => ({
            key: key, // store the key here
            ...cagesData[key],
          }));
          setCages(cageList);
        }

        const userData = await getAllUsers();

        if (userData) {
          const vetList = Object.keys(userData)
            .filter((key) => userData[key].role === "veterinarian")
            .map((key) => ({
              id: key,
              fullname: userData[key].fullname,
            }));
          setVets(vetList);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleVetChange = (cageKey, vet) => {
    setSelectedVets((prevSelectedVets) => ({
      ...prevSelectedVets,
      [cageKey]: vet,
    }));
  };

  const handleUpdate = async (cageKey, vetId) => {
    const vet = selectedVets[vetId];
    if (!vet) {
      console.error(`No veterinarian found for id: ${vetId}`);
      return;
    }

    const cageData = await getCageByKey(cageKey);
    if (!cageData) {
      console.error(`No cage found with key: ${cageKey}`);
      return;
    }
    console.log("Current Cage Data:", cageData);

    const updatedPets = cageData.pets.map((pet) => {
      if (pet.inCage) {
        return {
          ...pet,
          veterinarian: { id: vet.id, fullname: vet.fullname },
        };
      }
      return pet;
    });
    const updatedCageData = { ...cageData, pets: updatedPets };
    await updateCageByKey(cageKey, updatedCageData)
      .then(() => {
        console.log(`Cage ${cageKey} updated successfully.`);
      })
      .catch((error) => {
        console.error(`Error updating cage ${cageKey}:`, error);
      });
  };

  const handleRelease = async (cageKey) => {
    try {
      const cageData = await getCageByKey(cageKey);

      if (cageData) {
        const pets = cageData.pets || [];

        // Find the pet that is currently in the cage
        const petIndex = pets.findIndex((pet) => pet.inCage);
        if (petIndex !== -1) {
          pets[petIndex].inCage = false; // Set inCage to false

          const updatedCageData = { ...cageData, pets, status: "Available" };

          await updateCageByKey(cageKey, updatedCageData);
          console.log(`Cage ${cageKey} released successfully.`);
        } else {
          console.error("No pet currently in the cage.");
        }
      }
    } catch (error) {
      console.error(`Error releasing cage ${cageKey}:`, error);
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
      editable: true,
      renderCell: ({ row }) => {
        const vet =
          row.pets && row.pets.find((pet) => pet.inCage)?.veterinarian;
        return (
          <div style={{ fontSize: "16px" }}>
            {vet ? vet.fullname : "No Vet Assigned"}
          </div>
        );
      },
      renderEditCell: (params) => (
        <Typography sx={{ ml: "5px", fontSize: "20px" }}>
          <RoleEditCell
            {...params}
            vets={vets}
            handleVetChange={handleVetChange}
          />
        </Typography>
      ),
    },
    {
      field: "pets",
      headerName: (
        <Typography sx={{ fontSize: 18, fontWeight: "bold" }}>Pet</Typography>
      ),
      flex: 0.7,
      editable: false,
      renderCell: ({ value }) =>
        (value || [])
          .filter((pet) => pet.inCage)
          .map((pet) => (
            <div key={pet.petId} style={{ fontSize: "16px" }}>
              {pet.petId}
            </div>
          )),
    },
    {
      field: "update",
      headerName: (
        <Typography sx={{ fontSize: 18, fontWeight: "bold" }}>
          Update
        </Typography>
      ),
      flex: 0.6,

      renderCell: (params) => {
        const hasPetInCage = params.row.pets?.some((pet) => pet.inCage);
        const hasVetAssigned = params.row.pets?.some((pet) => pet.veterinarian);
        return (
          <div className="admin-update-button">
            <Button
              variant="contained"
              size="small"
              onClick={() => handleUpdate(params.row.key, params.row.id)}
              style={{
                marginRight: "16px",
                fontSize: "16px",
                backgroundColor: "green",
              }}
            >
              Update
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => handleRelease(params.row.key)}
              style={{
                marginLeft: "16px",
                fontSize: "16px",
                backgroundColor: "green",
              }}
              disabled={!(hasPetInCage && hasVetAssigned)}
            >
              Release
            </Button>
          </div>
        );
      },
    },
  ];

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredCages = cages.filter((cage) => {
    return (
      cage.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cage.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const displayedRows = filteredCages.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  return (
    <Box m="20px">
      <Header title="CAGES" subtitle="Managing Cages for pets" />
      <Box
        display="flex"
        backgroundColor={colors.primary[400]}
        borderRadius="3px"
        width={300}
      >
        <InputBase
          sx={{ ml: 2, flex: 1, fontSize: "20px" }}
          placeholder="Search by Cage ID or Name"
          value={searchQuery}
          onChange={handleSearch}
        />
        <IconButton type="button" sx={{ p: 1 }}>
          <SearchIcon sx={{ fontSize: "20px" }} />
        </IconButton>
      </Box>
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
          "& .MuiDataGrid-overlay": {
            fontSize: "18px",
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
          count={Math.ceil(filteredCages.length / rowsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default Cage;
