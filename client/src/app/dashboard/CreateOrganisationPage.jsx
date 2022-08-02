import { NetworkManager } from "../../utils/NetworkManager"
import Spacer from "../../components/Spacer"
import { useNavigate } from "react-router-dom"
import {
  validateSortCode,
  validateBankAccountNumber,
} from "../../utils/helpers/validation"
import { Colors } from "../../enums/Colors"
import Form, { generateValidator } from "../../components/Form"
import { IntField } from "../../components/input/IntField"
import Dropdown from "../../components/input/Dropdown"
import { useIntl } from "react-intl"
import { getCurrencyCode } from "../../utils/helpers/money"
import { isMobile } from "react-device-detect"
import { organiserTermsVersion } from "../../utils/constants"

export default function CreateOrganisationPage({ authUser }) {
  const navigate = useNavigate()
  const intl = useIntl()

  const handleCreateMerchant = async (data) => {

    const body = {
      ...data,
      organiserTermsVersion: organiserTermsVersion
    }

    const response = await NetworkManager.post("/merchants/create", body)

    const { merchantId } = response.data

    await authUser.reload()
    await authUser.getIdTokenResult(true)

    navigate(`/dashboard/o/${merchantId}/events/create`)
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
              ],
            },
            {
              title: "Bank details",
              explanation:
                "Enter the bank details for the account you want ticket sales paid into. It must be a valid UK or Irish bank account",
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
                  label: "Name on bank account"
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
        <p className="text-caption">
          By creating a Mercado organiser account you agree to our{" "}
          <a
            target="_blank"
            rel="noreferrer"
            href="/legal/organiser-terms-and-conditions"
          >
            Terms and Conditions
          </a>.
        </p>
        <Spacer y={6} />
      </div>
    </div>
  )
}
