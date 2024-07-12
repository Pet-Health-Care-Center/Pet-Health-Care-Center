import React, { useEffect, useState } from "react";

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
  return(
    <h1>Hello</h1>
  )
};

export default Dashboard;
