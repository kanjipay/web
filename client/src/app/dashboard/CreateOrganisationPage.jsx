import { useState } from "react";
import { NetworkManager, ApiName } from "../../utils/NetworkManager";
import TextField, { FileUploadGroup, InputGroup, TextArea } from "../../components/Input";
import MainButton from "../../components/MainButton";
import Spacer from "../../components/Spacer";
import { useNavigate } from "react-router-dom";

import {
  validateSortCode,
  validateBankAccountNumber,
} from "../../utils/helpers/validation";
import { Colors } from "../../components/CircleButton";

export default function CreateOrganisationPage() {
  const navigate = useNavigate()
  const [imageAsFile, setImageAsFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [values, setValues] = useState({
    displayName: "",
    description: "",
    address: "",
    companyName: "Test Ltd",
    sortCode: "000000",
    accountNumber: "12341234"
  })

  const handleImageAsFile = (e) => {
    const file = e.target.files[0]
    setImageAsFile(file)
  };

  async function handleSubmit() {
    setIsLoading(true)

    const merchantBody = {
      ...values,
      imageAsFile,
    };
    console.log(merchantBody);
    
    const response = await NetworkManager.post(
      ApiName.ONLINE_MENU,
      "/merchants/create",
      merchantBody
    );

    setIsLoading(false);

    const { merchantId } = response.data

    navigate(`/dashboard/o/${merchantId}`)
  }

  const handleInputChange = (event) => {
    const { target } = event
    const { name, value } = target

    if (["sortCode", "accountNumber"].includes(name)) {
      if (!/^[0-9]*$/.test(value)) { return }
      const charLimit = name === "sortCode" ? 6 : 8
      if (value.length > charLimit) { return } 
    }

    setValues({ ...values, [name]: value })
  }

  const canSubmitForm = () => {
    const requiredFields = [
      "sortCode",
      "accountNumber",
      "displayName",
      "address",
      "companyName",
      "description"
    ]

    return requiredFields.every(field => field in values && values[field].length > 0) && 
      imageAsFile && 
      validateBankAccountNumber(values.accountNumber) &&
      validateSortCode(values.sortCode)
  }

  return <div style={{ position: "relative", height: "100%" }}>
    <img alt="" src="/img/club_floor.jpg" style={{
      position: "absolute",
      width: "100%",
      zIndex: 0,
      height: 360,
      objectFit: "cover",
    }} />
    <div style={{ 
      width: 600,
      padding: 24,
      position: "absolute",
      left: "50%",
      top: 100,
      transform: "translate(-50%, 0)",
      zIndex: 40,
      backgroundColor: Colors.WHITE,
    }}>
      <h2 className="header-l">Create an organisation</h2>
      {/* <Spacer y={2} />
      <h3 className="header-s">Basic information</h3> */}
      <Spacer y={3} />
      <InputGroup 
        name="displayName"
        label="Display name"
        explanation="Event goers will see this when visiting your event pages."
        Input={TextField}
        value={values.displayName}
        onChange={handleInputChange}
      />
      <Spacer y={3} />
      <InputGroup
        name="description"
        label="Description"
        Input={TextArea}
        value={values.description}
        onChange={handleInputChange}
      />
      <Spacer y={3} />
      <FileUploadGroup
        name="image"
        label="Image"
        file={imageAsFile}
        onChange={handleImageAsFile}
      />

      <Spacer y={3} />
      <InputGroup
        name="address"
        label="Business address"
        Input={TextField}
        value={values.address}
        onChange={handleInputChange}
      />
      {/* <Spacer y={6} />
      <h3 className="header-s">Bank details</h3>
      <Spacer y={3} />
      <p className="text-body">Specify the account that ticket sales will be paid into. It needs to be a valid UK bank account.</p>
      <Spacer y={3} />
      <InputGroup
        name="companyName"
        label="Payment name"
        explanation="This name must exactly match the one on your bank account."
        Input={TextField}
        value={values.companyName}
        onChange={handleInputChange}
      />
      <Spacer y={3} />
      <InputGroup
        name="sortCode"
        label="Sort code"
        Input={TextField}
        value={values.sortCode}
        onChange={handleInputChange}
      />
      <Spacer y={3} />
      <InputGroup
        name="accountNumber"
        label="Account number"
        Input={TextField}
        value={values.accountNumber}
        onChange={handleInputChange}
      /> */}
      <Spacer y={3} />
      <MainButton
        title="Create organisation"
        onClick={handleSubmit}
        disabled={!canSubmitForm()}
        isLoading={isLoading}
      />
      <Spacer y={3} />
    </div>
  </div>
}
