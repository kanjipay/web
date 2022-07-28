import { updateDoc } from "firebase/firestore"
import { deleteObject } from "firebase/storage"
import { useParams } from "react-router-dom"
import Form from "../../../../components/Form"
import { TextArea } from "../../../../components/Input"
import Dropdown from "../../../../components/input/Dropdown"
import { Field, IntField } from "../../../../components/input/IntField"
import MainButton from "../../../../components/MainButton"
import SimpleImagePicker from "../../../../components/SimpleImagePicker"
import Spacer from "../../../../components/Spacer"
import TabControl from "../../../../components/TabControl"
import Collection from "../../../../enums/Collection"
import { getMerchantStorageRef } from "../../../../utils/helpers/storage"
import { uploadImage } from "../../../../utils/helpers/uploadImage"
import { redirectToCrezco } from "./redirectToCrezco"

export default function SettingsPage({ merchant }) {
  const { merchantId } = useParams()

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
        photo: file?.name ?? merchant.photo,
      })
    )
  }

  const handleChangeBankDetails = async (data) => {
    window.open("mailto:team@mercadopay.co")
  }

  const details = <div style={{ maxWidth: 500 }}>
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
  </div>

  const paymentMethods = <div style={{ maxWidth: 500 }}>
    <h3 className="header-xs">Crezco</h3>
    <Spacer y={2} />
    <p className="text-body-faded">
      {merchant.crezco?.userId
        ? "You're connected with Crezco. This means your customers can pay you via bank transfer."
        : "Connect with Crezco to enable customers to pay for tickets with an instant bank transfer."}
    </p>
    {!merchant.crezco?.userId && (
      <div>
        <Spacer y={2} />
        <MainButton
          title="Connect with Crezco"
          test-id="connect-crezco-button"
          onClick={() => redirectToCrezco(merchantId)}
        />
      </div>
    )}

  </div>

  return (
    <div>
      <Spacer y={5} />
      <h1 className="header-l">Settings</h1>
      <Spacer y={3} />
      <TabControl
        name="settings-page"
        tabs={{
          "Details": details,
          "Payment Methods": paymentMethods
        }}
      />
      <Spacer y={9} />
    </div>
  )
}
