import { updateDoc } from "firebase/firestore";
import { deleteObject, uploadBytes } from "firebase/storage";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Form from "../../../components/Form";
import ImagePicker from "../../../components/ImagePicker";
import { TextArea } from "../../../components/Input";
import { Field, IntField } from "../../../components/input/IntField";
import ResultBanner, { ResultType } from "../../../components/ResultBanner";
import Spacer from "../../../components/Spacer";
import Collection from "../../../enums/Collection";
import { getMerchantStorageRef } from "../../../utils/helpers/storage";

export default function SettingsPage({ merchant }) {
  const { merchantId } = useParams()
  
  const handleSaveDetails = async (data) => {
    const promises = []

    if (data.photo instanceof File) {
      const file = data.photo
      data.photo = file.name

      promises.push(
        uploadBytes(getMerchantStorageRef(merchantId, file.name), file)
      )

      promises.push(
        deleteObject(getMerchantStorageRef(merchantId, merchant.photo))
      )
    } else {
      delete data.photo
    }

    promises.push(
      updateDoc(Collection.MERCHANT.docRef(merchantId), {
        ...data,
      })
    )
  }

  const handleChangeBankDetails = async (data) => {

  }

  return <div>
    <Spacer y={5} />
    <h1 className="header-l">Settings</h1>
    <Spacer y={2} />
    <div style={{ display: "grid", columnGap: 64, gridTemplateColumns: "1fr 1fr" }}>
      <div>
        <Form
          initialDataSource={{
            ...merchant,
            photo: getMerchantStorageRef(merchantId, merchant.photo)
          }}
          formGroupData={[
            {
              title: "Basic information",
              items: [
                {
                  name: "displayName",
                  explanation: "Event goers will see this when visiting your event pages."
                },
                {
                  name: "description",
                  input: <TextArea />
                },
                {
                  name: "photo",
                  input: <ImagePicker isRemovable={false} />
                },
                {
                  name: "address",
                  label: "Business address"
                },
              ]
            }
          ]}
          onSubmit={handleSaveDetails}
          submitTitle="Save"
        />
        <Spacer y={6} />
        {/* <Form
          initialDataSource={merchant}
          formGroupData={[
            {
              title: "Bank details",
              items: [
                {
                  name: "companyName",
                  explanation: "This name must exactly match the one on your bank account.",
                  input: <Field disabled={true} />
                },
                {
                  name: "sortCode",
                  validations: [],
                  input: <IntField disabled={true} maxChars={6} />
                },
                {
                  name: "accountNumber",
                  validations: [],
                  input: <IntField disabled={true} maxChars={8} />
                }
              ]
            }
          ]}
          submitTitle="Change"
          onSubmit={handleChangeBankDetails}
        />
        <Spacer y={6} /> */}
        
      </div>

      <div>
        
      </div>
    </div>
  </div>
}