import { Colors } from "../enums/Colors"
import IconButton from "./IconButton"
import { ButtonTheme } from "./ButtonTheme"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import Back from "../assets/icons/Back"
import FlexSpacer from "./layout/FlexSpacer"
import { Flex } from "./Listing"

export default function NavBar({
  back,
  title,
  leftElements = [],
  rightElements = [],
  transparentDepth,
  opaqueDepth,
  sidePadding = 8
}) {
  const navigate = useNavigate()

  const changesOpacity = transparentDepth && opaqueDepth
  const initialOpacity = changesOpacity ? 0 : 1

  const [opacity, setOpacity] = useState(initialOpacity)

  const handleBackClick = () => {
    if (!back) { return }

    if (typeof back === "string") {
      navigate(back)
    } else {
      back()
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      const yOffset = window.scrollY
      const newOpacity = Math.max(
        Math.min(
          (yOffset - transparentDepth) / (opaqueDepth - transparentDepth),
          1
        ),
        0
      )

      setOpacity(newOpacity)
    }

    if (changesOpacity) {
      window.addEventListener("scroll", handleScroll)

      return () => {
        window.removeEventListener("scroll", handleScroll)
      }
    }
  }, [transparentDepth, opaqueDepth, changesOpacity])

  return (
    <div
      style={{
        position: "fixed",
        width: "100%",
        height: 48,
        zIndex: 100,
        maxWidth: "inherit",
        display: "relative",
      }}
    >
      <div
        style={{
          backgroundColor: Colors.WHITE,
          opacity,
          width: "100%",
          height: "100%",
          position: "absolute",
          padding: "0px 48px",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: `1px solid ${Colors.OFF_WHITE}`,
        }}
      >
        {
          typeof title === "string" ?
            <h1 className="header-xs" style={{
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}>{title}</h1> :
            title
        }
      </div>

      <Flex columnGap={8} style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        padding: `0px ${sidePadding}px`,
        boxSizing: "border-box",
      }}>
        {back && (
          <div className="NavBar__item">
            <IconButton
              Icon={Back}
              buttonTheme={ButtonTheme.NAVBAR}
              onClick={handleBackClick}
            />
          </div>
        )}
        {leftElements.map((e, index) => (
          <div key={index}>{e}</div>
        ))}
        <FlexSpacer />
        {rightElements.map((e, index) => (
          <div key={index}>{e}</div>
        ))}
      </Flex>
    </div>
  )
}
