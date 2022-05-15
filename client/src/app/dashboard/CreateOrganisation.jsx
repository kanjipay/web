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
  const [imageAsFile, setImageAsFile] = useState('')

  const handleImageAsFile = (e) => {
    const image = e.target.files[0]
    setImageAsFile(imageFile => (image))
  };

  async function handleSubmit() {
    const merchantBody = {
      accountNumber,
      companyName,
      displayName,
      description,
      address,
      sortCode,
      imageAsFile,
    };
    console.log(merchantBody);
    
    const response = await NetworkManager.post(
      ApiName.ONLINE_MENU,
      "/merchants/create",
      merchantBody
    );

    const merchantId = response.data.merchantId;

    const redirectUrl = new URL(window.location.href)
    redirectUrl.pathname = `/dashboard/o/${merchantId}/confirm-crezco`

    console.log("mercado redirect url", redirectUrl.href)

    const crezcoRegisteredUrl = new URL(process.env.REACT_APP_CREZCO_REDIRECT)
    crezcoRegisteredUrl.searchParams.append("redirect_uri", redirectUrl.href)

    console.log("crezco register url", crezcoRegisteredUrl.href)

    window.location.replace(crezcoRegisteredUrl.href);
  }

  return (
    <div style={{ maxWidth: 900, padding: "0 24px", margin: "auto" }}>
      <Spacer y={12} />
      <h2 className="header-l">Register Organisation</h2>
      <Spacer y={2} />
      <h3 className="header-m">Organisation Details</h3>
      <Spacer y={2} />
      <p className="text-body">Display Name</p>
      <Spacer y={1} />

      <Input
        name="displayName"
        value={displayName}
        onChange={(event) => setDisplayName(event.target.value)}
      />
      <Spacer y={2} />
      <p className="text-body">Description</p>
      <Spacer y={1} />
      <Input
        name="description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      <Spacer y={2} />
      <p className="text-body">Image</p>
      <Spacer y={1} />
      <input 
          type="file"
          onChange={handleImageAsFile}
        />


      <Spacer y={2} />
      <p className="text-body">Business address</p>
      <Spacer y={1} />
      <Input
        name="address"
        value={address}
        onChange={(event) => setAddress(event.target.value)}
      />
      <h3 className="header-m">Bank Details</h3>
      <Spacer y={2} />
      <p className="text-body">Company Name</p>
      <Spacer y={1} />
      <Input
        name="companyName"
        value={companyName}
        onChange={(event) => setCompanyName(event.target.value)}
      />

      <p className="text-body">Account Number</p>
      <Spacer y={1} />

      <Input
        name="accountNumber"
        value={accountNumber}
        onChange={(event) => setAccountNumber(event.target.value)}
      />
      <Spacer y={2} />
      <h4 className="header-xs">Sort Code</h4>
      <Spacer y={1} />
      <Input
        name="sortCode"
        type="number"
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
            description && 
            imageAsFile &&
            validateBankAccountNumber(accountNumber) &&
            validateSortCode(sortCode)
          )
        }
      />
      <Spacer y={3} />
    </div>
  );
}
