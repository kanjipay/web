import { updateDoc } from "firebase/firestore"
import { deleteObject } from "firebase/storage"
import { useState } from "react"
import { useParams } from "react-router-dom"
import Form from "../../../components/Form"
import ImagePicker from "../../../components/ImagePicker"
import { TextArea } from "../../../components/Input"
import Dropdown from "../../../components/input/Dropdown"
import { Field, IntField } from "../../../components/input/IntField"
import MainButton from "../../../components/MainButton"
import SimpleImagePicker from "../../../components/SimpleImagePicker"
import Spacer from "../../../components/Spacer"
import Collection from "../../../enums/Collection"
import StripeStatus from "../../../enums/StripeStatus"
import { getMerchantStorageRef } from "../../../utils/helpers/storage"
import { uploadImage } from "../../../utils/helpers/uploadImage"
import { NetworkManager } from "../../../utils/NetworkManager"
import { redirectToCrezco } from "./redirectToCrezco"

export default function SettingsPage({ merchant }) {
  const { merchantId } = useParams()
  const [isRedirectingToStripe, setIsRedirectingToStripe] = useState(false)

  const handleSaveDetails = async (data) => {
    const promises = []
    const file = data.photo?.file

    if (file) {
      const merchantRef = getMerchantStorageRef(merchantId, file.name)

      data.photo = { storageRef: merchantRef }

      promises.push(uploadImage(merchantRef, file))

      promises.push(
        deleteObject(getMerchantStorageRef(merchantId, merchant.photo))
      )
    }

    promises.push(
      updateDoc(Collection.MERCHANT.docRef(merchantId), {
        ...data,
        photo: merchant.photo,
      })
    )
  }

  const handleChangeBankDetails = async (data) => {
    window.open("mailto:team@mercadopay.co")
  }

  const handleContinueToStripe = async () => {
    setIsRedirectingToStripe(true)

    const res = await NetworkManager.post(
      `/merchants/m/${merchantId}/create-stripe-account-link`
    )

    const { redirectUrl } = res.data

    window.location.href = redirectUrl
  }

  return (
    <div>
      <Spacer y={5} />
      <h1 className="header-l">Settings</h1>
      <Spacer y={2} />
      <div
        style={{
          display: "grid",
          columnGap: 64,
          gridTemplateColumns: "1fr 1fr",
        }}
      >
        <div>
          <Form
            initialDataSource={{
              ...merchant,
              photo: {
                storageRef: getMerchantStorageRef(merchantId, merchant.photo),
              },
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
                    input: <SimpleImagePicker isRemovable={false} />,
                  },
                  {
                    name: "address",
                    label: "Business address",
                  },
                ],
              },
            ]}
            onSubmit={handleSaveDetails}
            submitTitle="Save changes"
          />
          <Spacer y={6} />
          <Form
            initialDataSource={merchant}
            formGroupData={[
              {
                title: "Bank details",
                explanation: "Contact us to change these details",
                items: [
                  {
                    name: "currency",
                    input: (
                      <Dropdown
                        optionList={[
                          { label: "Pounds", value: "GBP" },
                          { label: "Euros", value: "EUR" },
                        ]}
                      />
                    ),
                    disabled: true,
                  },
                  {
                    name: "companyName",
                    explanation:
                      "This name must exactly match the one on your bank account.",
                    input: <Field />,
                    disabled: true,
                  },
                  {
                    name: "sortCode",
                    validations: [],
                    input: <IntField disabled={true} maxChars={6} />,
                    disabled: true,
                  },
                  {
                    name: "accountNumber",
                    validations: [],
                    input: <IntField disabled={true} maxChars={8} />,
                    disabled: true,
                  },
                ],
              },
            ]}
            submitTitle="Contact us to change"
            onSubmit={handleChangeBankDetails}
          />
          <Spacer y={6} />
          <div>
            <h2 className="header-s">Payment methods</h2>
            <Spacer y={2} />
            <h3 className="header-xs">Crezco</h3>
            <Spacer y={2} />
            <p className="text-body-faded">{
              merchant.crezco?.userId ?
                "You're connected with Crezco. This means your customers can pay you via bank transfer." :
                "Connect with Crezco to enable customers to pay for tickets with an instant bank transfer."
            }</p>
            {
              !merchant.crezco?.userId && <div>
                <Spacer y={2} />
                <MainButton
                  title="Connect with Crezco"
                  test-id="connect-crezco-button"
                  onClick={() => redirectToCrezco(merchantId)}
                />
              </div>
            }
            
            <Spacer y={4} />
            <h3 className="header-xs">Stripe</h3>
            <Spacer y={2} />
            <p className="text-body-faded">{
              merchant.stripe?.status === StripeStatus.CHARGES_ENABLED ?
                "You're connected with Stripe. This means your customers can pay you via card" :
                "Connect with Stripe to enable customers to pay for tickets with a card. This is a useful fallback for customers with international bank accounts."
            }</p>
            <Spacer y={2} />
            <MainButton
              title={
                merchant.stripe
                  ? "Continue your Stripe onboarding"
                  : "Connect with Stripe"
              }
              test-id="connect-stripe-button"
              onClick={handleContinueToStripe}
              isLoading={isRedirectingToStripe}
            />
            <Spacer y={6} />
          </div>
        </div>

        <div></div>
      </div>
    </div>
  )
}
