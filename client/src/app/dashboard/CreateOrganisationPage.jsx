import { NetworkManager } from "../../utils/NetworkManager"
import { TextArea } from "../../components/Input"
import Spacer from "../../components/Spacer"
import { useNavigate } from "react-router-dom"
import {
  validateSortCode,
  validateBankAccountNumber,
} from "../../utils/helpers/validation"
import { Colors } from "../../enums/Colors"
import Form, { generateValidator } from "../../components/Form"
import { IntField } from "../../components/input/IntField"
import { ResultType } from "../../components/ResultBanner"
import { getMerchantStorageRef } from "../../utils/helpers/storage"
import { auth } from "../../utils/FirebaseUtils"
import { onIdTokenChanged } from "firebase/auth"
import Dropdown from "../../components/input/Dropdown"
import { useIntl } from "react-intl"
import { getCurrencyCode } from "../../utils/helpers/money"
import { uploadImage } from "../../utils/helpers/uploadImage"
import SimpleImagePicker from "../../components/SimpleImagePicker"
import { isMobile } from "react-device-detect"

export default function CreateOrganisationPage({ authUser }) {
  const navigate = useNavigate()
  const intl = useIntl()

  onIdTokenChanged(auth, (user) => {
    console.log("id token changed")
  })

  const handleCreateMerchant = async (data) => {
    const { file: photoFile } = data.photo

    const body = {
      ...data,
      photo: photoFile.name,
    }

    const response = await NetworkManager.post("/merchants/create", body)

    const { merchantId } = response.data

    await authUser.reload()
    await authUser.getIdTokenResult(true)

    const ref = getMerchantStorageRef(merchantId, photoFile.name)

    await uploadImage(ref, photoFile)

    navigate(`/dashboard/o/${merchantId}/events/create`)

    return { resultType: ResultType.SUCCESS }
  }

  return (
    <div style={{ position: "relative", height: "100%", backgroundColor: Colors.RED, width: "100%" }}>
      <img
        alt=""
        src="/img/club_floor.jpg"
        style={{
          position: "absolute",
          width: "100%",
          zIndex: 0,
          height: 360,
          objectFit: "cover",
        }}
      />
      <div
        style={{
          width: isMobile ? "100%" : 600,
          padding: isMobile ? 16 : 24,
          boxSizing: "border-box",
          position: "absolute",
          left: "50%",
          top: 100,
          transform: "translate(-50%, 0)",
          zIndex: 40,
          backgroundColor: Colors.WHITE,
        }}
      >
        <h2 className="header-l">Create an organisation</h2>
        <Spacer y={3} />
        <Form
          initialDataSource={{
            currency: getCurrencyCode(intl.locale),
          }}
          formGroupData={[
            {
              title: "Basic information",
              items: [
                {
                  name: "displayName",
                  explanation:
                    "Event goers will see this when visiting your event pages.",
                },
                {
                  name: "description",
                  input: <TextArea />,
                },
                {
                  name: "photo",
                  explanation:
                    "This will appear on your organisation's page for event goers to see.",
                  input: <SimpleImagePicker />,
                },
                {
                  name: "address",
                  label: "Business address",
                },
              ],
            },
            {
              title: "Bank details",
              explanation:
                "Enter the bank details for the bank you want your ticket sales to be paid into. It must be a valid UK or Irish bank account",
              items: [
                {
                  name: "currency",
                  explanation:
                    "This wil be the currency you'll accept payments in.",
                  input: (
                    <Dropdown
                      optionList={[
                        { value: "GBP", label: "Pounds" },
                        { value: "EUR", label: "Euros" },
                      ]}
                    />
                  ),
                },
                {
                  name: "companyName",
                },
                {
                  name: "sortCode",
                  validators: [
                    generateValidator(
                      validateSortCode,
                      "Your sort code needs to be 6 characters"
                    ),
                  ],
                  input: <IntField maxChars={6} />,
                },
                {
                  name: "accountNumber",
                  validators: [
                    generateValidator(
                      validateBankAccountNumber,
                      "Your account number needs to be 7-8 characters"
                    ),
                  ],
                  input: <IntField maxChars={8} />,
                },
              ],
            },
          ]}
          onSubmit={handleCreateMerchant}
          submitTitle="Create organisation"
        />
        <Spacer y={3} />
        <div>
          By creating a Mercado organiser account you agree to our{" "}
          <a
            target="_blank"
            rel="noreferrer"
            href="/legal/organiser-terms-and-conditions"
          >
            Terms and Conditions
          </a>
        </div>
        <Spacer y={6} />
      </div>
    </div>
  )
}
