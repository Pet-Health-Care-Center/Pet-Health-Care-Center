import React, { useState, useEffect } from "react";
import { auth } from "../../../../Components/firebase/firebase";
import { updateProfile } from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";

import {
  Box,
  Typography,
  useTheme,
  Button,
  IconButton,
  Select,
  MenuItem,
  Pagination,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../../../theme";
import { mockDataTeam } from "../../../data/mockData";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import MedicationIcon from "@mui/icons-material/Medication";
import Header from "../../../../Components/dashboardChart/Header";
import { updateUserById } from "../../../account/getUserData";

const RoleEditCell = ({ id, value, api }) => {
  const [role, setRole] = useState(value);

  const handleChange = (event) => {
    setRole(event.target.value);
    api.setEditCellValue({
      id: id,
      field: "role",
      value: event.target.value,
    });
  };

  return (
    <div className="role-menu">
      <Select value={role} onChange={handleChange} autoFocus fullWidth>
        <MenuItem sx={{ fontSize: "16px" }} value="admin">
          Admin
        </MenuItem>
        <MenuItem sx={{ fontSize: "16px" }} value="user">
          User
        </MenuItem>
        <MenuItem sx={{ fontSize: "16px" }} value="manager">
          Manager
        </MenuItem>
        <MenuItem sx={{ fontSize: "16px" }} value="veterinarian">
          Vet
        </MenuItem>
      </Select>
    </div>
  );
};

function Team() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [loading, setLoading] = useState(true);
  const [userUpdated, setUserUpdated] = useState(false);
  const [rows, setRows] = useState(mockDataTeam);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const validateEmail = (email) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const checkDuplicateData = (row) => {
    return rows.some((item) => {
      if (item.id !== row.id) {
        return item.email === row.email || item.username === row.username;
      }
      return false;
    });
  };

  const handleUpdateAccount = async (event, row) => {
    event.preventDefault();
    setLoading(true);

    let isValid = true;
    const updates = {};
    if (row.email) {
      if (!validateEmail(row.email)) {
        isValid = false;
        toast.error("Invalid email");
      } else {
        updates.email = row.email;
        localStorage.setItem("email", row.email);
      }
    }
    if (row.username) {
      updates.username = row.username;
      localStorage.setItem("username", row.username);
    }
    if (row.accountBalance) {
      updates.accountBalance = row.accountBalance;
      localStorage.setItem("accountBalance", row.accountBalance);
    }
    if (row.phone) {
      updates.phone = row.phone;
    }
    if (row.role) {
      updates.role = row.role;
    }
    if (row.address) {
      updates.address = row.address;
    }
    if (row.fullname) {
      updates.fullname = row.fullname;
    }

    if (isValid && Object.keys(updates).length > 0) {
      const isDuplicateEmailUsernamePhone = checkDuplicateData(row);
      if (isDuplicateEmailUsernamePhone) {
        toast.error("Email, username or phone number are duplicated !!!");
        setLoading(false);
        return;
      }

      try {
        await updateProfile(auth.currentUser, {
          phone: row.phone,
          address: row.address,
          fullname: row.fullname,
          role: row.role,
        });

        await updateUserById(`${row.id}`, updates);
        setRows(rows.map((item) => (item.id === row.id ? row : item))); // Update row in state
        setUserUpdated(true);
        toast.success("Updated successful !!!");
      } catch (error) {
        toast.error("Error");
      }
    } else if (!isValid) {
      toast.warning("Please check all the input fields");
    } else {
      toast.warning("Nothing changed");
    }
    setLoading(false);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const filteredRows = rows.filter(
    (row) => row.email && row.email.toLowerCase().includes(searchQuery)
  );

  const handelAccountStatus = async (event, id, accountStatus) => {
    event.preventDefault();
    setLoading(true);

    try {
      await updateUserById(id, { accountStatus });

      setRows(
        rows.map((item) => (item.id === id ? { ...item, accountStatus } : item))
      );
      toast.success(`User ${accountStatus}d successfully!`);
    } catch (error) {
      toast.warning(`Error ${accountStatus}ing user.`);
    }

    setLoading(false);
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const displayedRows = filteredRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const columns = [
    {
      field: "id",
      headerName: (
        <Typography sx={{ fontSize: 18, fontWeight: "bold" }}>ID</Typography>
      ),
      width: 150,
      editable: false,
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
      flex: 0.6,
      editable: true,
      renderCell: ({ value }) => (
        <div style={{ fontSize: "16px" }}>{value}</div>
      ),
    },
    {
      field: "phone",
      headerName: (
        <Typography sx={{ fontSize: 18, fontWeight: "bold" }}>
          Phone Number
        </Typography>
      ),
      flex: 0.8,
      editable: true,
      renderCell: ({ value }) => (
        <div style={{ fontSize: "16px" }}>{value}</div>
      ),
    },
    {
      field: "email",
      headerName: (
        <Typography sx={{ fontSize: 18, fontWeight: "bold" }}>Email</Typography>
      ),
      flex: 1,
      editable: true,
      renderCell: ({ value }) => (
        <div style={{ fontSize: "16px" }}>{value}</div>
      ),
    },
    {
      field: "accountBalance",
      headerName: (
        <Typography sx={{ fontSize: 18, fontWeight: "bold" }}>
          Balance
        </Typography>
      ),
      flex: 0.6,
      editable: true,
      renderCell: ({ value }) => (
        <div style={{ fontSize: "16px" }}>{value}</div>
      ),
    },
    {
      field: "role",
      headerName: (
        <Typography sx={{ fontSize: 18, fontWeight: "bold" }}>Role</Typography>
      ),
      flex: 1,
      renderCell: ({ value }) => {
        return (
          <Box
            width="80%"
            p="5px"
            margin=".6rem"
            display="flex"
            justifyContent="center"
            backgroundColor={
              value === "admin"
                ? colors.blueAccent[500]
                : colors.blueAccent[500]
            }
            borderRadius="4px"
          >
            {value === "admin" && (
              <AdminPanelSettingsOutlinedIcon
                sx={{ fontSize: "22px", marginTop: "4px" }}
              />
            )}
            {value === "manager" && (
              <SecurityOutlinedIcon
                sx={{ fontSize: "22px", marginTop: "4px" }}
              />
            )}
            {value === "user" && (
              <LockOpenOutlinedIcon
                sx={{ fontSize: "22px", marginTop: "4px" }}
              />
            )}
            {value === "veterinarian" && (
              <MedicationIcon sx={{ fontSize: "22px", marginTop: "4px" }} />
            )}
            <Typography
              color={colors.grey[100]}
              sx={{ ml: "5px", fontSize: "20px" }}
            >
              {value}
            </Typography>
          </Box>
        );
      },
      editable: true,

      renderEditCell: (params) => (
        <Typography sx={{ ml: "5px", fontSize: "20px" }}>
          <RoleEditCell {...params} />
        </Typography>
      ),
    },
    {
      field: "accountStatus",
      headerName: (
        <Typography sx={{ fontSize: 18, fontWeight: "bold" }}>
          Account Status
        </Typography>
      ),
      flex: 0.7,
      renderCell: ({ value }) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Typography
            color={value === "disabled" ? "red" : "green"}
            sx={{
              fontSize: "20px",
              textAlign: "start",
            }}
          >
            {value === "enable"
              ? "Enable"
              : value === "disabled"
              ? "Disabled"
              : value}
          </Typography>
        </div>
      ),
    },
    {
      field: "update",
      headerName: (
        <Typography sx={{ fontSize: 18, fontWeight: "bold" }}>
          Update
        </Typography>
      ),
      flex: 0.5,
      renderCell: (params) => (
        <div className="admin-update-button">
          <Button
            variant="contained"
            size="small"
            onClick={(event) => handleUpdateAccount(event, params.row)}
            style={{
              marginRight: "10px",
              fontSize: "16px",
              backgroundColor: "green",
            }}
          >
            Update
          </Button>
        </div>
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
            onClick={(event) =>
              handelAccountStatus(event, params.row.id, "enable")
            }
            style={{
              marginRight: "10px",
              fontSize: "16px",
              backgroundColor: "green",
            }}
          >
            Enable
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={(event) =>
              handelAccountStatus(event, params.row.id, "disabled")
            }
            style={{
              marginRight: "10px",
              fontSize: "16px",
              backgroundColor: "red",
            }}
          >
            Disable
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Box m="20px">
      <Header title="USERS" subtitle="Managing the User Members" />
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
          "& .MuiDataGrid-overlay": {
            fontSize: "24px",
          },
          "& .MuiInputBase-input": {
            fontSize: "20px",
          },
          "& .MuiInputBase-root": {
            width: "209px",
          },
          "& .MuiSelect-select": {
            fontSize: "18px",
            marginRight: "60px",
            paddingRight: "20px",
          },
        }}
      >
        <DataGrid rows={displayedRows} columns={columns} pagination={true} />
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
          count={Math.ceil(filteredRows.length / rowsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Box>
  );
}

export default Team;
