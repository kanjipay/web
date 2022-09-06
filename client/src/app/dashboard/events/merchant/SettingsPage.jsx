import { updateDoc } from "firebase/firestore"
import { deleteObject } from "firebase/storage"
import { useNavigate, useParams } from "react-router-dom"
import Form from "../../../../components/Form"
import { TextArea } from "../../../../components/Input"
import Dropdown from "../../../../components/input/Dropdown"
import { Field, IntField } from "../../../../components/input/IntField"
import SimpleImagePicker from "../../../../components/SimpleImagePicker"
import Spacer from "../../../../components/Spacer"
import Collection from "../../../../enums/Collection"
import { getMerchantStorageRef } from "../../../../utils/helpers/storage"
import { uploadImage } from "../../../../utils/helpers/uploadImage"
import { ResultType } from "../../../../components/ResultBanner"
import Breadcrumb from "../../../../components/Breadcrumb"
import TabControl from "../../../../components/TabControl"
import { useState } from "react"
import ConnectPaymentMethodsBanner from "./ConnectPaymentMethodsBanner"

export default function SettingsPage({ merchant }) {
  const { merchantId } = useParams()
  const [linkName, setLinkName] = useState(merchant.linkName)

  const handleSaveDetails = async (data) => {
    const promises = []
    const file = data.photo?.file
    const storageRef = data.photo?.storageRef

    console.log("hasFile: ", !!file)
    console.log("hasStorageRef: ", !!storageRef)

    if (file) {
      const merchantRef = getMerchantStorageRef(merchantId, file.name)

      data.photo = { storageRef: merchantRef }

      promises.push(uploadImage(merchantRef, file))
    }
    
    if (!storageRef && merchant.photo) {
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

    await Promise.all(promises)

    return {
      resultType: ResultType.SUCCESS,
      message: "Changes saved"
    }
  }

  const handleChangeBankDetails = async (data) => {
    window.open("mailto:team@mercadopay.co")
  }

  const basicSettingsTab = <div style={{ maxWidth: 500 }}>
    <Form
      initialDataSource={{
        ...merchant,
        photo: merchant.photo ? {
          storageRef: getMerchantStorageRef(merchantId, merchant.photo),
        } : {},
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
              required: false,
            },
            {
              name: "photo",
              input: <SimpleImagePicker isRemovable={false} />,
              required: false
            },
            {
              name: "address",
              label: "Business address",
              required: false
            },
          ],
        },
      ]}
      onSubmit={handleSaveDetails}
      submitTitle="Save changes"
    />
  </div>

  const brandedLinkUrl = new URL(window.location.href)
  brandedLinkUrl.pathname = linkName ? `/l/${linkName}` : "/l/your-name-here"

  const bankDetailsTab = <div style={{ maxWidth: 500 }}>
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

  return <div>
    <Spacer y={2} />
    <Breadcrumb pageData={[
      { title: "Settings" }
    ]}/>
    <Spacer y={2} />
    <h1 className="header-l">Organiser Settings</h1>
    <Spacer y={3}/>
    <ConnectPaymentMethodsBanner merchant={merchant} />
    <TabControl tabs={{ 
      "Basic details": basicSettingsTab,
      "Bank details": bankDetailsTab
    }}/>

    <Spacer y={9} />
  </div>
}
