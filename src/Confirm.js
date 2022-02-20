import React from "react";

function Confirm({ setPage }) {
  const handleClick = () => {
    setPage("summary");
  };
  return (
    <div>
      <div>Are you sure?</div>;
      <button
        className="btn btn-primary btn-block mb-4"
        type="submit"
        onClick={handleClick}
      >
        Pay with Bank transfer
      </button>
    </div>
  );
}

export default Confirm;
