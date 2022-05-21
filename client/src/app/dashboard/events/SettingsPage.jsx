import { updateDoc } from "firebase/firestore";
import { useState } from "react";
import { useParams } from "react-router-dom";
import TextField, { InputGroup, TextArea } from "../../../components/Input";
import MainButton from "../../../components/MainButton";
import ResultBanner, { ResultType } from "../../../components/ResultBanner";
import Spacer from "../../../components/Spacer";
import Collection from "../../../enums/Collection";

export default function SettingsPage({ merchant }) {
  const { merchantId } = useParams()
  const initialValues = {
    ...merchant
  }
  const [values, setValues] = useState(initialValues)
  const [isLoading, setIsLoading] = useState(false)
  const [shouldShowResultBanner, setShouldShowResultBanner] = useState(false)

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

  const handleSaveDetails = () => {
    setIsLoading(true)

    const {
      displayName,
      description,
      address
    } = values

    updateDoc(Collection.MERCHANT.docRef(merchantId), {
      displayName,
      description,
      address
    }).then(() => {
      setIsLoading(false)
      setShouldShowResultBanner(true)

      setTimeout(() => {
        setShouldShowResultBanner(false)
      }, 3000)
    })
  }

  return <div>
    <Spacer y={5} />
    <h1 className="header-l">Settings</h1>
    <Spacer y={2} />
    <div style={{ display: "grid", columnGap: 64, gridTemplateColumns: "1fr 1fr" }}>
      <div>
        <h3 className="header-s">Basic information</h3>
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
        {/* <Spacer y={3} />
      <FileUploadGroup
        name="image"
        label="Image"
        file={imageAsFile}
        onChange={handleImageAsFile}
      /> */}

        <Spacer y={3} />
        <InputGroup
          name="address"
          label="Business address"
          Input={TextField}
          value={values.address}
          onChange={handleInputChange}
        />
        <Spacer y={3} />
        <MainButton title="Save details" onClick={handleSaveDetails} isLoading={isLoading} />
        <Spacer y={3} />
        {
          shouldShowResultBanner && <div>
            <ResultBanner resultType={ResultType.SUCCESS} message="Details saved successfully" />
            <Spacer y={3} />
          </div>
        }
        
      </div>

      {/* <div>
        <h3 className="header-s">Bank details</h3>
        <Spacer y={3} />
        <p className="text-body">This is the account that ticket sales will be paid into. It needs to be a valid UK bank account.</p>
        <Spacer y={3} />
        <InputGroup
          name="companyName"
          label="Payment name"
          disabled={true}
          explanation="This name must exactly match the one on your bank account."
          Input={TextField}
          value={values.companyName}
          onChange={handleInputChange}
        />
        <Spacer y={3} />
        <InputGroup
          name="sortCode"
          label="Sort code"
          disabled={true}
          Input={TextField}
          value={values.sortCode}
          onChange={handleInputChange}
        />
        <Spacer y={3} />
        <InputGroup
          name="accountNumber"
          label="Account number"
          disabled={true}
          Input={TextField}
          value={values.accountNumber}
          onChange={handleInputChange}
        />

      </div> */}
      
    </div>
    
  </div>
}