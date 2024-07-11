import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getDatabase, ref, get, update, set, onValue } from "firebase/database";
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from "@mui/material";
import { toast } from "react-toastify";
import { getAuth } from "firebase/auth";
import moment from "moment-timezone";
import { fetchBookings } from "../../../booking/fetchBooking";
import { fetchUserById } from "../../../account/getUserData";
import { fetchPetDetails } from "../../../pet/fetchPet";
import LoadingAnimation from "../../../../animation/loading-animation";

const MedicalRecord = () => {
  const { userId, bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [diagnostic, setDiagnostic] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [prescription, setPrescription] = useState("");
  const [notes, setNotes] = useState("");
  const [cageRequired, setCageRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableCages, setAvailableCages] = useState([]);
  const [selectedCage, setSelectedCage] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const auth = getAuth();
  const [vetSchedule, setVetSchedule] = useState([]);
  const [user, setUser] = useState("");
  const navigate = useNavigate();
  const [width, setWidth] = useState(0);
  const [showMedicalHistory, setShowMedicalHistory] = useState(false);
  const elementRef = useRef(null);

  useLayoutEffect(() => {
    const updateWidth = () => {
      if (elementRef.current) {
        setWidth(elementRef.current.clientWidth);
      }
    };

    window.addEventListener("resize", updateWidth);
    updateWidth(); // Update width initially

    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await fetchUserById(userId);
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  useEffect(() => {
    const fetchVetSchedule = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userData = await fetchUserById(currentUser.uid);
          if (userData.schedule) {
            setVetSchedule(userData.schedule);
            console.log("Fetched vet schedule:", userData.schedule); // Debugging
          } else {
            console.error("No vet schedule data found");
          }
        }
      } catch (error) {
        console.error("Error fetching vet schedule:", error);
        toast.error("Error fetching vet schedule. Please try again.");
      }
    };
    fetchVetSchedule();
  }, [auth]);

  useEffect(() => {
    const fetchBookingDetails = async (userId, bookingId) => {
      try {
        const db = getDatabase();
        const bookingRef = ref(db, `users/${userId}/bookings/${bookingId}`);
        const snapshot = await get(bookingRef);
        const data = snapshot.val();
        if (data) {
          setBooking(data);

          const petRef = ref(db, `users/${userId}/pets/${data.pet.key}`);
          const petSnapshot = await get(petRef);
          const petData = petSnapshot.val();
          if (petData && petData.medicalHistory) {
            setMedicalHistory(petData.medicalHistory);
          }
        } else {
          console.error("No booking data found");
        }
      } catch (error) {
        console.error("Error fetching booking details:", error);
      }
    };
    fetchBookingDetails(userId, bookingId);
  }, [userId, bookingId]);

  useEffect(() => {
    const db = getDatabase();
    const medicalHistoryRef = ref(
      db,
      `users/${userId}/pets/${booking?.pet.key}/medicalHistory`
    );
    const unsubscribe = onValue(medicalHistoryRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const medicalHistoryArray = Object.values(data);
        setMedicalHistory(medicalHistoryArray);
      } else {
        setMedicalHistory([]);
      }
    });

    return () => unsubscribe();
  }, [userId, booking?.pet.key]);

  useEffect(() => {
    const fetchCages = async () => {
      try {
        const db = getDatabase();
        const cageRef = ref(db, "cages");
        const snapshot = await get(cageRef);
        const data = snapshot.val();
        const availableCages = Object.entries(data)
          .filter(([key, cage]) => cage.status === "Available")
          .map(([key, cage]) => ({ key, ...cage }));
        setAvailableCages(availableCages);
        console.log("Available cages:", availableCages);
        if (availableCages.length > 0) {
          setSelectedCage(availableCages[0]);
        }
      } catch (error) {
        console.error("Error fetching cages:", error);
      }
    };

    fetchCages();
  }, []);

  const handleSave = async () => {
    if (cageRequired) {
      if (availableCages.length === 0) {
        toast.error("No available cages");
        return;
      }

      const selectedCage = availableCages[0];
      console.log(selectedCage.key);

      try {
        const petDetails = {
          date: moment().tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY"),
          petId: booking.pet.key,
          inCage: true,
          bookingId: booking.bookingId,
          petName: booking.pet.name,
          petOwner: user?.username,
        };

        await saveMedicalRecord(userId, bookingId, {
          cageRequired,
          diagnostic,
          symptoms,
          prescription,
          notes,
        });

        // Update cage status to 'Occupied'
        const db = getDatabase();
        const cageRef = ref(db, `cages/${selectedCage.key}`);
        const cageSnapshot = await get(cageRef);
        const cageData = cageSnapshot.val();
        const updatedCagePets = [...(cageData?.pets || []), petDetails];
        await update(cageRef, { status: "Occupied", pets: updatedCagePets });
        toast.success("Medical record saved successfully!");
      } catch (error) {
        console.error("Error saving medical record:", error);
        toast.error("Error saving medical record. Please try again.");
      }
    } else {
      try {
        await saveMedicalRecord(userId, bookingId, {
          diagnostic,
          symptoms,
          prescription,
          notes,
          cageRequired,
          bookingId: booking.bookingId,
        });
        toast.success("Medical record saved successfully!");
        // navigate(-1);
      } catch (error) {
        console.error("Error saving medical record:", error);
        toast.error("Error saving medical record. Please try again.");
      }
    }
  };

  const saveMedicalRecord = async (userId, bookingId, record) => {
    try {
      const db = getDatabase();
      const currentUser = auth.currentUser;

      // Kiểm tra currentUser
      if (!currentUser) {
        throw new Error("Current user is not authenticated.");
      }

      // Lấy dữ liệu booking hiện tại
      const bookingRef = ref(db, `users/${userId}/bookings/${bookingId}`);
      const bookingSnapshot = await get(bookingRef);
      if (!bookingSnapshot.exists()) {
        throw new Error("Booking not found.");
      }
      const booking = bookingSnapshot.val();

      // Cập nhật dữ liệu booking
      const updatedBookingData = {
        ...booking,
        medicalRecord: {
          date: `${booking.date} - ${booking.time}`,
          ...record,
        },
      };
      // await update(bookingRef, updatedBookingData);

      // Cập nhật dữ liệu lịch trình của bác sĩ thú y
      const vetScheduleRef = ref(
        db,
        `users/${currentUser.uid}/schedule/${booking.date}`
      );
      const vetScheduleSnapshot = await get(vetScheduleRef);
      const vetScheduleData = vetScheduleSnapshot.val();

      if (vetScheduleData && Array.isArray(vetScheduleData)) {
        const updatedVetSchedule = vetScheduleData.map((item) => {
          if (item.bookingId === booking.bookingId) {
            return {
              ...item,
              isChecked: false,
            };
          }
          return item;
        });
        await set(vetScheduleRef, updatedVetSchedule);
      } else {
        console.error(
          "Vet schedule data for the specified date is not an array or does not exist"
        );
      }

      const petRef = ref(db, `users/${userId}/pets/${booking.pet.key}`);
      const petSnapshot = await get(petRef);
      if (!petSnapshot.exists()) {
        throw new Error("Pet not found.");
      }
      const petData = petSnapshot.val();
      const updatedMedicalHistory = petData.medicalHistory || [];
      updatedMedicalHistory.push({
        date: `${booking.date} - ${booking.time}`,
        bookingId: booking.bookingId,
        ...record,
      });
      // await update(petRef, { medicalHistory: updatedMedicalHistory });

      console.log("Updated pet medical history:", updatedMedicalHistory);

      toast.success("Medical history updated successfully!");
    } catch (error) {
      console.error("Error saving medical record:", error);
      toast.error("Error saving medical record. Please try again.");
    }
  };

  if (!booking) return <LoadingAnimation />;

  const styles = {
    container: {
      backgroundColor: "#ebeff2",
      padding: "40px",
      borderRadius: "10px",
      boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.75)",
      maxWidth: "90%",
      margin: "auto",
      marginTop: "20px",
      marginBottom: "20px",
      color: "#0fb3bd",
    },
    header: {
      marginBottom: "20px",
      textAlign: "center",
    },
    petImage: {
      display: "block",
      margin: "auto",
      borderRadius: "8px",
      maxWidth: "100%",
      marginBottom: "20px",
      width: "300px",
    },
    table: {
      borderCollapse: "collapse",
      width: "100%",
      marginBottom: "20px",
      backgroundColor: "#ebeff2",
    },
    tableHeader: {
      backgroundColor: "#f0f0f0",
      fontWeight: "bold",
    },
    tableRow: {
      borderBottom: "1px solid #ccc",
      backgroundColor: "#ebeff2",
      color: "#0fb3bd",
    },
    tableCell: {
      backgroundColor: "#ebeff2",
      padding: "10px",
      borderColor: "black",
    },
    nameCell: {
      color: "#0fb3bd",
      fontWeight: "bold",
    },
    valueCell: {
      color: "black",
    },
    textField: {
      "& .MuiOutlinedInput-root": {
        "& fieldset": {
          borderColor: "black",
        },
        "&:hover fieldset": {
          borderColor: "black",
        },
      },
    },
  };

  const toggleMedicalHistory = () => {
    setShowMedicalHistory(!showMedicalHistory);
  };

  return (
    <Box sx={styles.container}>
      {loading && <LoadingAnimation />}
      <Typography variant="h2" gutterBottom sx={styles.header}>
        Medical Record
      </Typography>
      {booking?.pet?.imageUrl && (
        <img src={booking?.pet?.imageUrl} alt="Pet" style={styles.petImage} />
      )}
      <Grid container spacing={6}>
        <Grid item xs={6}>
          <Typography variant="h4">User Info</Typography>
          <table style={styles.table}>
            <tbody>
              <tr style={styles.tableRow}>
                <td style={{ ...styles.tableCell, ...styles.nameCell }}>
                  Username:
                </td>
                <td style={{ ...styles.tableCell, ...styles.valueCell }}>
                  {user?.username}
                </td>
              </tr>
              <tr style={styles.tableRow}>
                <td style={{ ...styles.tableCell, ...styles.nameCell }}>
                  Address:
                </td>
                <td style={{ ...styles.tableCell, ...styles.valueCell }}>
                  {user?.address || "N/A"}
                </td>
              </tr>
              <tr style={styles.tableRow}>
                <td style={{ ...styles.tableCell, ...styles.nameCell }}>
                  Phone:
                </td>
                <td style={{ ...styles.tableCell, ...styles.valueCell }}>
                  {user?.phone || "N/A"}
                </td>
              </tr>
              <tr style={styles.tableRow}>
                <td style={{ ...styles.tableCell, ...styles.nameCell }}>
                  Email:
                </td>
                <td style={{ ...styles.tableCell, ...styles.valueCell }}>
                  {user?.email}
                </td>
              </tr>
            </tbody>
          </table>
        </Grid>

        <Grid item xs={6}>
          <Typography variant="h4">Pet Info</Typography>
          <table style={styles.table}>
            <tbody>
              <tr style={styles.tableRow}>
                <td style={{ ...styles.tableCell, ...styles.nameCell }}>
                  Name:
                </td>
                <td style={{ ...styles.tableCell, ...styles.valueCell }}>
                  {booking?.pet?.name}
                </td>
              </tr>
              <tr style={styles.tableRow}>
                <td style={{ ...styles.tableCell, ...styles.nameCell }}>
                  Breed:
                </td>
                <td style={{ ...styles.tableCell, ...styles.valueCell }}>
                  {booking?.pet?.breed || "N/A"}
                </td>
              </tr>
              <tr style={styles.tableRow}>
                <td style={{ ...styles.tableCell, ...styles.nameCell }}>
                  Age:
                </td>
                <td style={{ ...styles.tableCell, ...styles.valueCell }}>
                  {booking?.pet?.age || "N/A"}
                </td>
              </tr>
              <tr style={styles.tableRow}>
                <td style={{ ...styles.tableCell, ...styles.nameCell }}>
                  Weight:
                </td>
                <td style={{ ...styles.tableCell, ...styles.valueCell }}>
                  {booking?.pet?.weight || "N/A"}
                </td>
              </tr>
            </tbody>
          </table>
        </Grid>
      </Grid>

      <button onClick={toggleMedicalHistory}>Medical History</button>

      {showMedicalHistory && (
        <Box mt={2} height={180} overflow={"auto"} border={"solid 1px black"}>
          <Grid container spacing={3} padding={2}>
            <Grid item xs={6}>
              <Box>
                {medicalHistory
                  .slice(0, Math.ceil(medicalHistory.length / 2))
                  .map((record, index) => (
                    <Box key={index} mb={2} borderBottom={"solid"}>
                      <Grid container>
                        <Grid item xs={4} style={{ textAlign: "left" }}>
                          <Typography variant="body1" fontSize={"20px"}>
                            <strong>Date:</strong>
                          </Typography>
                        </Grid>
                        <Grid item xs={8} style={{ textAlign: "left" }}>
                          <Typography
                            variant="body1"
                            fontSize={"20px"}
                            color="black"
                          >
                            {record.date || "N/A"}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item xs={4} style={{ textAlign: "left" }}>
                          <Typography variant="body1" fontSize={"20px"}>
                            <strong>Diagnostic:</strong>
                          </Typography>
                        </Grid>
                        <Grid item xs={8} style={{ textAlign: "left" }}>
                          <Typography
                            variant="body1"
                            fontSize={"20px"}
                            color="black"
                          >
                            {record.diagnostic || "N/A"}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item xs={4} style={{ textAlign: "left" }}>
                          <Typography variant="body1" fontSize={"20px"}>
                            <strong>Prescription:</strong>
                          </Typography>
                        </Grid>
                        <Grid item xs={8} style={{ textAlign: "left" }}>
                          <Typography
                            variant="body1"
                            fontSize={"20px"}
                            color="black"
                          >
                            {record.prescription || "N/A"}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item xs={4} style={{ textAlign: "left" }}>
                          <Typography variant="body1" fontSize={"20px"}>
                            <strong>Symptoms:</strong>
                          </Typography>
                        </Grid>
                        <Grid item xs={8} style={{ textAlign: "left" }}>
                          <Typography
                            variant="body1"
                            fontSize={"20px"}
                            color="black"
                          >
                            {record.symptoms || "N/A"}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item xs={4} style={{ textAlign: "left" }}>
                          <Typography variant="body1" fontSize={"20px"}>
                            <strong>Notes:</strong>
                          </Typography>
                        </Grid>
                        <Grid item xs={8} style={{ textAlign: "left" }}>
                          <Typography
                            variant="body1"
                            fontSize={"20px"}
                            color="black"
                          >
                            {record.notes || "N/A"}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box>
                {medicalHistory
                  .slice(Math.ceil(medicalHistory.length / 2))
                  .map((record, index) => (
                    <Box key={index} mb={2} borderBottom={"solid"}>
                      <Grid container>
                        <Grid item xs={4} style={{ textAlign: "left" }}>
                          <Typography variant="body1" fontSize={"20px"}>
                            <strong>Date:</strong>
                          </Typography>
                        </Grid>
                        <Grid item xs={8} style={{ textAlign: "left" }}>
                          <Typography
                            variant="body1"
                            fontSize={"20px"}
                            color="black"
                          >
                            {record.date || "N/A"}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item xs={4} style={{ textAlign: "left" }}>
                          <Typography variant="body1" fontSize={"20px"}>
                            <strong>Diagnostic:</strong>
                          </Typography>
                        </Grid>
                        <Grid item xs={8} style={{ textAlign: "left" }}>
                          <Typography
                            variant="body1"
                            fontSize={"20px"}
                            color="black"
                          >
                            {record.diagnostic || "N/A"}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item xs={4} style={{ textAlign: "left" }}>
                          <Typography variant="body1" fontSize={"20px"}>
                            <strong>Prescription:</strong>
                          </Typography>
                        </Grid>
                        <Grid item xs={8} style={{ textAlign: "left" }}>
                          <Typography
                            variant="body1"
                            fontSize={"20px"}
                            color="black"
                          >
                            {record.prescription || "N/A"}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item xs={4} style={{ textAlign: "left" }}>
                          <Typography variant="body1" fontSize={"20px"}>
                            <strong>Symptoms:</strong>
                          </Typography>
                        </Grid>
                        <Grid item xs={8} style={{ textAlign: "left" }}>
                          <Typography
                            variant="body1"
                            fontSize={"20px"}
                            color="black"
                          >
                            {record.symptoms || "N/A"}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item xs={4} style={{ textAlign: "left" }}>
                          <Typography variant="body1" fontSize={"20px"}>
                            <strong>Notes:</strong>
                          </Typography>
                        </Grid>
                        <Grid item xs={8} style={{ textAlign: "left" }}>
                          <Typography
                            variant="body1"
                            fontSize={"20px"}
                            color="black"
                          >
                            {record.notes || "N/A"}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}
      <Grid container spacing={3} mt={3}>
        <Grid item xs={6}>
          <TextField
            label="Diagnostic"
            value={diagnostic}
            onChange={(e) => setDiagnostic(e.target.value)}
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            InputLabelProps={{
              style: {
                fontSize: "1.6rem",
                color: "black",
              },
            }}
            InputProps={{
              style: {
                fontSize: "1.5rem",
                color: "black",
              },
            }}
            sx={styles.textField}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Symptoms"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            InputLabelProps={{
              style: { fontSize: "1.6rem", color: "black" },
            }}
            InputProps={{
              style: { fontSize: "1.5rem", color: "black" },
            }}
            sx={styles.textField}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Prescription"
            value={prescription}
            onChange={(e) => setPrescription(e.target.value)}
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            InputLabelProps={{
              style: {
                fontSize: "1.6rem",
                color: "black",
              },
            }}
            InputProps={{
              style: { fontSize: "1.5rem", color: "black" },
            }}
            sx={styles.textField}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            InputLabelProps={{
              style: { fontSize: "1.6rem", color: "black" },
            }}
            InputProps={{
              style: { fontSize: "1.5rem", color: "black" },
            }}
            sx={styles.textField}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl component="fieldset">
            <FormLabel
              component="legend"
              style={{
                fontSize: "1.8rem",
                color: "#000",
              }}
            >
              After examination, does the animal need to be kept in a cage?
            </FormLabel>
            <RadioGroup
              row
              value={cageRequired}
              onChange={(e) => setCageRequired(e.target.value === "true")}
              sx={{ marginTop: "8px" }}
            >
              <FormControlLabel
                value={true}
                control={
                  <Radio sx={{ "& .MuiSvgIcon-root": { fontSize: 28 } }} />
                }
                label={
                  <Typography style={{ fontSize: "1.5rem", color: "black" }}>
                    Yes
                  </Typography>
                }
                sx={{ marginRight: "24px" }}
              />
              <FormControlLabel
                value={false}
                control={
                  <Radio sx={{ "& .MuiSvgIcon-root": { fontSize: 28 } }} />
                }
                label={
                  <Typography style={{ fontSize: "1.5rem", color: "black" }}>
                    No
                  </Typography>
                }
              />
            </RadioGroup>
          </FormControl>
        </Grid>
      </Grid>
      <Box display="flex" justifyContent="center" mt={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate(-1)}
          sx={{
            fontSize: "1.6rem",
            padding: "12px 24px",
            marginRight: "24px",
            backgroundColor: "#CF0070",
            "&:hover": {
              backgroundColor: "#ec63ad",
            },
          }}
        >
          Back
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          sx={{
            fontSize: "1.6rem",
            padding: "12px 24px",
            backgroundColor: "#CF0070",
            "&:hover": {
              backgroundColor: "#ec63ad",
            },
          }}
        >
          Save
        </Button>
      </Box>
    </Box>
  );
};

export default MedicalRecord;
