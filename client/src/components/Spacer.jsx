import React from "react"
import Box from "@mui/material/Box"
import { createTheme } from "@mui/material/styles"

export default function Spacer({ x, y, basis, ...restProps }) {
  const theme = createTheme()
  return (
    <Box
      data-testid="Spacer"
      width={x ? theme.spacing(x) : undefined}
      height={y ? theme.spacing(y) : undefined}
      flexBasis={basis ? theme.spacing(basis) : undefined}
      flexGrow={0}
      flexShrink={0}
      {...restProps}
    />
  )
}
