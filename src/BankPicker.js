import React, { useState } from "react";

function BankTile({ bank, selectedBank, setBank }) {
  function onClickBank(event) {
    console.log(bank);
    setBank(bank);
  }

  let imgPath = "/img/" + bank + ".webp";
  return (
    <div className="col" onClick={onClickBank}>
      <img src={imgPath} className="img-fluid icon" />
    </div>
  );
}

function BankRow({ bankRow, selectedBank, setBank }) {
  return (
    <div className="row">
      {bankRow.map((bank) => (
        <BankTile
          bank={bank}
          selectedBank={selectedBank}
          setBank={setBank}
          key={bank}
        />
      ))}
    </div>
  );
}

function BankPicker({ selectedBank, setBank }) {
  const banks = [
    ["Monzo", "Revolut", "Santander"],
    ["RBS", "HSBC", "Barclays"],
    ["Natwest", "Lloyds", "Halifax"],
  ];

  return (
    <div className="container">
      <h5 className="mb-3">Select Bank - {selectedBank}</h5>
      {banks.map((bankRow) => (
        <BankRow
          bankRow={bankRow}
          selectedBank={selectedBank}
          key={bankRow}
          setBank={setBank}
        />
      ))}
      <br />
    </div>
  );
}

export default BankPicker;
