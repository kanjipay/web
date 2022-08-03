import { Colors } from "../../../../enums/Colors";
import { useState } from "react";
import Forward from "../../../../assets/icons/Forward";

export function MenuItem({
  title, onClick, style, showsSeparator = true, showsArrow = false, isSelected = false, ...props
}) {
  const [isHovering, setIsHovering] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{
        height: 48,
        display: "flex",
        padding: 16,
        cursor: onClick ? "pointer" : "mouse",
        color: onClick ? Colors.BLACK : Colors.GRAY_LIGHT,
        backgroundColor: isHovering || isSelected ? Colors.OFF_WHITE_LIGHT : Colors.CLEAR,
        alignItems: "center",
        boxSizing: "border-box",
        borderBottom: showsSeparator ? `1px solid ${Colors.OFF_WHITE}` : 0,
        fontWeight: isSelected ? 500 : 400,
        ...style,
      }}
    >
      {title}
      <div className="flex-spacer"></div>
      {showsArrow && (
        <div
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Forward length={16} color={Colors.GRAY} />
        </div>
      )}
    </div>
  );
}
