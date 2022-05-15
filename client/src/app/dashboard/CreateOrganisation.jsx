import { useState } from "react";

import { NetworkManager, ApiName } from "../../utils/NetworkManager";
import Input from "../../components/Input";
import MainButton from "../../components/MainButton";
import Spacer from "../../components/Spacer";

import {
  validateSortCode,
  validateBankAccountNumber,
} from "../../utils/helpers/validation";

export default function CreateOrganisation() {
  const [displayName, setDisplayName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [sortCode, setSortCode] = useState("");

  async function handleSubmit() {
    const merchantBody = {
      accountNumber,
      companyName,
      displayName,
      address,
      sortCode,
    };
    const response = await NetworkManager.post(
      ApiName.ONLINE_MENU,
      "/merchants/create",
      merchantBody
    );
    const merchantId = response.data.merchantId;
    console.log(merchantId);
    /*
        todo create link between user and merchant
        */
    const crezcoRegisteredUrl =
      process.env.REACT_APP_CREZCO_REDIRECT + "?merchant-id=" + merchantId;
    window.location.replace(crezcoRegisteredUrl);
  }

  return (
    <div className="content">
      <h2 className="header-l">Register Organisation</h2>
      <Spacer y={2} />
      <h3 className="header-m">Organisation Details</h3>
      <Spacer y={2} />
      <p className="text-body">Display Name</p>
      <Spacer y={1} />

      <Input
        placeholder="Display name"
        name="displayName"
        value={displayName}
        onChange={(event) => setDisplayName(event.target.value)}
      />
      <Spacer y={2} />
      <p className="text-body">Description</p>
      <Spacer y={1} />
      <Input
        placeholder="Desciption of my organisation"
        name="description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />

      <Spacer y={2} />
      <p className="text-body">Business address</p>
      <Spacer y={1} />
      <Input
        placeholder="business address"
        name="address"
        value={address}
        onChange={(event) => setAddress(event.target.value)}
      />
      <h3 className="header-m">Bank Details</h3>
      <Spacer y={2} />
      <p className="text-body">Company Name</p>
      <Spacer y={1} />
      <Input
        placeholder="Organisation's name - must match bank details"
        name="companyName"
        value={companyName}
        onChange={(event) => setCompanyName(event.target.value)}
      />

      <p className="text-body">Account Number</p>
      <Spacer y={1} />

      <Input
        placeholder="Bank Account Number"
        name="accountNumber"
        value={accountNumber}
        onChange={(event) => setAccountNumber(event.target.value)}
      />
      <Spacer y={2} />
      <p className="text-body">Sort Code</p>
      <Spacer y={1} />
      <Input
        placeholder="040004"
        name="sortCode"
        value={sortCode}
        onChange={(event) => setSortCode(event.target.value)}
      />

      <Spacer y={2} />
      <p className="text-body">
        Continue by registering with our payment parter, Crezco
      </p>
      <Spacer y={1} />
      <MainButton
        title="Register"
        onClick={handleSubmit}
        disabled={
          !(
            displayName &&
            companyName &&
            address &&
            validateBankAccountNumber(accountNumber) &&
            validateSortCode(sortCode)
          )
        }
      />
    </div>
  );
}
