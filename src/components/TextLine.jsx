import "./TextLine.css";
import Spacer from "./Spacer";

function TextLine(props) {
  const { leftComponent, rightComponent, spacer } = props;

  const spacerWanted = spacer ? spacer > 0 : false;

  return (
    <div className="grid-container">
      <div className="header-xs">{leftComponent}</div>

      <div className="__detailsTextLineRightText text-caption">
        {rightComponent}
      </div>

      {spacerWanted ? <Spacer y={spacer} /> : <div></div>}
    </div>
  );
}

export default TextLine;
