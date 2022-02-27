import React from "react";

function Summary({ setPage }) {
  const handleClick = () => {
    setPage("details");
  };
  return (
    <div className="App">
      <div className="text-2xl">Thank you!</div>
      <div className="text-md">Payment Not Successful</div>
      <button
        className="btn btn-primary btn-block mb-4"
        type="submit"
        onClick={handleClick}
      >
        Make another payment?
      </button>
    </div>
  );
}

export default Summary;
