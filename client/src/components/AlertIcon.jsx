import * as React from "react"
import { Box, ThemeProvider, createTheme } from "@mui/system"

const theme = createTheme({
  palette: {
    background: {
      paper: "#f4511e",
    },
    text: {
      primary: "#173A5E",
      secondary: "#46505A",
    },
    action: {
      active: "#001E3C",
    },
    success: {
      dark: "#009688",
    },
  },
})

export default function AlertIcon(backgroundColor, textColor) {
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          bgcolor: "background.paper",
          boxShadow: 1,
          borderRadius: 2,
          p: 1,
        }}
      >
        <Box sx={{ color: "text.secondary", display: "inline", fontSize: 14 }}>
          Active
        </Box>
      </Box>
    </ThemeProvider>
  )
}
