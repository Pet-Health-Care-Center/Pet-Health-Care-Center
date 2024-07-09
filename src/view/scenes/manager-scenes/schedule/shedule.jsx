import React, { useState, useEffect, useRef, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
import { Box, List, ListItem, ListItemText, Typography } from "@mui/material";
import { getDatabase, ref, get, update } from "firebase/database";
import { getAuth } from "firebase/auth";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const ManagerSchedule = () => {
  const [events, setEvents] = useState([]);
  const [vets, setVets] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const auth = getAuth();
  const dragContainerRef = useRef(null);
  const [vetsFetched, setVetsFetched] = useState(false);
  const [eventsFetched, setEventsFetched] = useState(false);

  useEffect(() => {
    if (!vetsFetched) {
      const fetchVets = async () => {
        const db = getDatabase();
        const vetsRef = ref(db, "users");
        const snapshot = await get(vetsRef);
        const vetsData = snapshot.val();
        const vetsList = Object.keys(vetsData)
          .filter((uid) => vetsData[uid].role === "veterinarian")
          .map((uid) => ({
            uid,
            name: vetsData[uid].fullname,
            schedule: vetsData[uid].schedule || {},
            specialization: vetsData[uid].specialization,
          }));
        setVets(vetsList);
        setVetsFetched(true); // Set the flag to true after fetching
      };

      fetchVets();
    }
  }, [vetsFetched]);

  useEffect(() => {
    if (!eventsFetched && vetsFetched) {
      const fetchEvents = () => {
        const eventsList = [];
        vets.forEach((vet) => {
          Object.keys(vet.schedule).forEach((date) => {
            if (vet.schedule[date] === true) {
              eventsList.push({
                id: `${vet.uid}-${date}`,
                title: `Work Day - ${vet.name}`,
                start: date,
                allDay: true,
                backgroundColor: "lightgrey",
                borderColor: "lightgrey",
                textColor: "black",
                extendedProps: {
                  vetId: vet.uid,
                  vetName: vet.name,
                },
              });
            }
          });
        });
        setEvents(eventsList);
        setEventsFetched(true); // Set the flag to true after fetching
      };

      fetchEvents();
    }
  }, [vets, vetsFetched, eventsFetched]);

  useEffect(() => {
    if (dragContainerRef.current && vetsFetched) {
      new Draggable(dragContainerRef.current, {
        itemSelector: ".draggable-item",
        eventData: function (eventEl) {
          const vetId = eventEl.getAttribute("data-vetid");
          const vetName = eventEl.getAttribute("data-vetname");
          return {
            title: `Work Day - ${vetName}`,
            extendedProps: {
              vetId,
              vetName,
            },
            allDay: true,
            backgroundColor: "lightgrey",
            borderColor: "lightgrey",
            textColor: "black",
          };
        },
      });
    }
  }, [vetsFetched]);

  const handleEventReceive = useCallback(
    async (info) => {
      if (isUpdating) return;
      setIsUpdating(true);

      const { event } = info;
      const { extendedProps } = event;

      const eventExists = events.some(
        (e) => e.id === `${extendedProps.vetId}-${event.startStr}`
      );

      if (!eventExists) {
        const newEvent = {
          id: `${extendedProps.vetId}-${event.startStr}`,
          title: `Work Day - ${extendedProps.vetName}`,
          start: event.startStr,
          allDay: true,
          backgroundColor: "lightgrey",
          borderColor: "lightgrey",
          textColor: "black",
          extendedProps: {
            vetId: extendedProps.vetId,
            vetName: extendedProps.vetName,
          },
        };

        setEvents((prevEvents) => [...prevEvents, newEvent]);

        const db = getDatabase();
        const updates = {};
        updates[`users/${extendedProps.vetId}/schedule/${event.startStr}`] = true;
        await update(ref(db), updates);
        toast.success("Set schedule for vet successfully!");
      } else {
        toast.error("Vet already has a schedule on this day!");
      }

      setIsUpdating(false);
    },
    [events, isUpdating]
  );

  const handleEventClick = async (info) => {
    const { event } = info;

    if (window.confirm(`Delete event '${event.title}'?`)) {
      setEvents((prevEvents) => prevEvents.filter((e) => e.id !== event.id));

      const db = getDatabase();
      const eventId = event.extendedProps.vetId;
      const eventDate = event.startStr;
      const updates = {};
      updates[`users/${eventId}/schedule/${eventDate}`] = null;
      await update(ref(db), updates);

      toast.success("Vet schedule deleted successfully!");
    }
  };

  const handleDateClick = (arg) => {
    const newEvent = {
      id: arg.dateStr,
      title: "Work Day",
      start: arg.dateStr,
      allDay: true,
      backgroundColor: "lightgrey",
      borderColor: "lightgrey",
      textColor: "black",
    };
    setEvents((prevEvents) => [...prevEvents, newEvent]);

    const db = getDatabase();
    const updates = {};
    updates[`schedule/${arg.dateStr}`] = true;
    update(ref(db), updates);

    toast.success("Vet schedule added successfully!", {
      autoClose: 2000,
    });
  };


  return (
    <>
      <ToastContainer />
      <Box display="flex" flexDirection="column" height="100vh">
        <Box p={2} bgcolor="primary.main" color="white">
          <Typography variant="h5">Manage Doctor Schedules</Typography>
        </Box>
        <Box display="flex" flex="1" overflow="hidden">
          <Box flex="1" p={2} overflow="auto" ref={dragContainerRef}>
            <Typography variant="h6">Doctors</Typography>
            <List>
              {vets.map((vet) => (
                <ListItem
                  key={vet.uid}
                  className="draggable-item"
                  data-vetid={vet.uid}
                  data-vetname={vet.name}
                  draggable
                  style={{ backgroundColor: "#f0f0f0", border: "4px solid #ccc" }}
                >
                  <ListItemText
                    primary={vet.name}
                    secondary={vet.specialization}
                    secondaryTypographyProps={{
                      color: "#000",
                      fontSize: "1.6rem",
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
          <Box flex="3">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,dayGridWeek,dayGridDay",
              }}
              events={events}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              droppable={true}
              eventReceive={handleEventReceive}
            />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default ManagerSchedule;