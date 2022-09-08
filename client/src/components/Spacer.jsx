import React from "react"

export default function Spacer({ x, y, basis, ...restProps }) {
  return <div style={{
    height: y * 8,
    width: x ? x * 8 : "100%", 
    flexGrow: 0,
    flexShrink: 0
  }}></div>
}
