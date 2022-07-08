import { useState } from "react";
import SmallButton from "./SmallButton";
import { ButtonTheme } from "./ButtonTheme";


export function CopyToClipboardButton({ text }) {
  const [hasCopiedToClipboard, setHasCopiedToClipboard] = useState(false);
  const buttonTitle = hasCopiedToClipboard ? "Copied" : "Copy";

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setHasCopiedToClipboard(true);

    setTimeout(() => setHasCopiedToClipboard(false), 3000);
  };

  return (
    <SmallButton
      title={buttonTitle}
      buttonTheme={ButtonTheme.MONOCHROME_OUTLINED}
      onClick={handleCopyToClipboard} />
  );
}
