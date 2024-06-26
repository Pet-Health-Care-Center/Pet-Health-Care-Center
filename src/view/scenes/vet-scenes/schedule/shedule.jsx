import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { Box, Typography, List, ListItem, ListItemText, useTheme } from "@mui/material";
import { getDatabase, ref, onValue, get } from "firebase/database";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Header from "../../../../Components/dashboardChart/Header";
import { ToastContainer, toast } from "react-toastify";
import Clock from 'react-live-clock';
import { tokens } from "../../../../theme";

const Schedule = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [currentEvents, setCurrentEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const auth = getAuth();
  const navigate = useNavigate();
  

  const convertScheduleToEvents = (schedule) => {
    const events = [];
    for (const [date, bookings] of Object.entries(schedule)) {
      if (bookings === true) {
        events.push({
          id: `${date}-placeholder`,
          title: "Scheduled Work Day",
          start: date,
          allDay: true,
          backgroundColor: "lightgrey",
          borderColor: "lightgrey",
          textColor: "black",
          extendedProps: {
            isPlaceholder: true, 
          },
        });
      } else if (Array.isArray(bookings)) {
        bookings
          .filter((booking) => booking.status === 1)
          .forEach((booking, index) => {
            events.push({
              id: `${date}-${index}`,
              title: `Booking with ${booking.username}`,
              start: `${date}T${booking.time}:00`,
              allDay: false,
              extendedProps: {
                services: booking.services.join(", "),
                petName: booking.petName,
                userId: booking.userId,
                bookingId: booking.bookingId,
                isChecked: booking.isChecked || false, 
              },
            });
          });
      }
    }
    return events;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const db = getDatabase();
          const userRef = ref(db, "users/" + currentUser.uid);

          onValue(userRef, (snapshot) => {
            const data = snapshot.val();
            if (data && data.schedule) {
              const events = convertScheduleToEvents(data.schedule);
              setCurrentEvents(events);
            }
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [auth]);

  const handleEventClick = async (selected) => {
    const { userId, bookingId, isChecked, isPlaceholder } = selected.event.extendedProps;

    if (isPlaceholder) {
      toast.info("This is a placeholder for a scheduled work day.");
      return;
    }

    if (isChecked) {
      toast.info("This booking is checked already and cannot be accessed.");
      return;
    }

    if (userId) {
      const db = getDatabase();
      const bookingsRef = ref(db, `users/${userId}/bookings`);
      const snapshot = await get(bookingsRef);
      const bookingsData = snapshot.val();

      if (bookingsData) {
        const bookingKey = Object.keys(bookingsData).find(
          (key) => bookingsData[key].bookingId === bookingId
        );
        if (bookingKey) {
          navigate(`/vet/booking/medical-record/${userId}/${bookingKey}`);
        } else {
          console.error("Booking key not found for bookingId:", bookingId);
        }
      } else {
        console.error("No bookings found for user:", userId);
      }
    } else {
      console.error("User ID not found for event:", selected.event);
    }
  };

  const filterEventsByDate = (events, date) => {
    return events.filter(event => event.start.split('T')[0] === date);
  };

  const todaysEvents = filterEventsByDate(currentEvents, selectedDate);


  return (
    <Box m="20px">
      <Header title="Schedule" subtitle="All Bookings and Schedules are here!" />
      <div className="countdown">
        <div className="box">
          <span className="num">
            <Clock format={'HH'} ticking={true} timezone={'Asia/Ho_Chi_Minh'} />
          </span>
          <span className="text">Hours</span>
        </div>
        <div className="box">
          <span className="num">
            <Clock format={'mm'} ticking={true} timezone={'Asia/Ho_Chi_Minh'} />
          </span>
          <span className="text">Minutes</span>
        </div>
        <div className="box">
          <span className="num">
            <Clock format={'ss'} ticking={true} timezone={'Asia/Ho_Chi_Minh'} />
          </span>
          <span className="text">Seconds</span>
        </div>
      </div>
      <Box display="flex" justifyContent="space-between">
      <Box flex="1 1 20%" backgroundColor={colors.primary[400]} p="15px" borderRadius="4px">
          <Typography variant="h5">Events</Typography>
          <List>
            {todaysEvents.map((event) => (
              <ListItem
                key={event.id}
                sx={{
                  backgroundColor: colors.greenAccent[500],
                  margin: "10px 0",
                  borderRadius: "2px",
                }}
              >
                <ListItemText
                  primary={event.title}
                  secondary={
                    <Typography>
                      {event.start.split('T')[1] ? event.start.split('T')[1].slice(0, 5) : "All Day"}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
        <Box flex="1 1 100%" ml="15px">
          <FullCalendar
            height="75vh"
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
            }}
            initialView="timeGridDay"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            eventClick={handleEventClick}
            events={currentEvents}
          />
        </Box>
        <ToastContainer />
      </Box>
    </Box>
  );
};

export default Schedule;

