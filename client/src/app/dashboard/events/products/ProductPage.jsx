import { deleteDoc, updateDoc } from "firebase/firestore"
import { useNavigate, useParams } from "react-router-dom"
import Breadcrumb from "../../../../components/Breadcrumb"
import DatePicker from "../../../../components/DatePicker"
import Form from "../../../../components/Form"
import { TextArea } from "../../../../components/Input"
import {
  FieldDecorator,
  FloatField,
  IntField,
} from "../../../../components/input/IntField"
import Spacer from "../../../../components/Spacer"
import Collection from "../../../../enums/Collection"
import { dateFromTimestamp } from "../../../../utils/helpers/time"
import Popup from "reactjs-popup"
import MainButton from "../../../../components/MainButton"
import { ButtonTheme } from "../../../../components/ButtonTheme"
import { Modal } from "../../../../components/Modal"
import { getCurrencySymbol } from "../../../../utils/helpers/money"
import CheckBox from "../../../../components/CheckBox"
import { ResultType } from "../../../../components/ResultBanner"

export default function ProductPage({ event, products, merchant }) {
  const { productId } = useParams()
  const navigate = useNavigate()
  const product = products.find((p) => p.id === productId)
  const docRef = Collection.PRODUCT.docRef(productId)
  const isPublished = event?.isPublished

  const handleUpdateProduct = async (data) => {
    let update

    if (isPublished) {
      const { title, description, isAvailable, purchaserInfo } = data
      update = { title, description, isAvailable, purchaserInfo }
    } else {
      update = {
        ...data,
        price: parseFloat(data.price) * 100,
        capacity: parseInt(data.capacity, 10),
      }
    }

    await updateDoc(docRef, update)

    return {
      resultType: ResultType.SUCCESS,
      message: "Changes saved"
    }
  }

  const handleDeleteProduct = async () => {
    await deleteDoc(docRef)
    navigate("../..")
  }

  return (
    <div>
      <Spacer y={2} />
      <Breadcrumb
        pageData={[
          { title: "Events", path: "../..", testId: "events" },
          { title: event.title, path: "..", testId: "event" },
          { title: product.title },
        ]}
      />
      <Spacer y={2} />
      <h1 className="header-l">{product.title}</h1>
      <Spacer y={4} />
      <div
        style={{
          maxWidth: 500
        }}
      >
          <h2 className="header-m">Product details</h2>
          <Spacer y={3} />
          <Form
            initialDataSource={{
              ...product,
              releasesAt: dateFromTimestamp(product.releasesAt),
              earliestEntryAt: dateFromTimestamp(product.earliestEntryAt),
              latestEntryAt: dateFromTimestamp(product.latestEntryAt),
              price: product.price / 100,
            }}
            formGroupData={[
              {
                explanation: isPublished
                  ? "This event is published, so some fields can't be edited, and it can't be deleted."
                  : null,
                items: [
                  { name: "title" },
                  {
                    name: "price",
                    input: <FloatField maxChars={8} />,
                    decorator: (
                      <FieldDecorator
                        prefix={getCurrencySymbol(merchant.currency)}
                      />
                    ),
                  },
                  {
                    name: "capacity",
                    label: "Maximum capacity",
                    explanation: "Once this number of tickets has been sold for this ticket type, it will show as sold out.",
                    input: <IntField />,
                  },
                  {
                    name: "description",
                    input: <TextArea />,
                    required: false
                  },
                  {
                    name: "purchaserInfo",
                    explanation: "Specify information to be emailed to purchasers when they buy this ticket type.",
                    input: <TextArea />,
                    required: false
                  },
                  {
                    name: "releasesAt",
                    label: "Release date",
                    input: <DatePicker />,
                    required: false,
                  },
                  {
                    name: "earliestEntryAt",
                    label: "Earliest entry",
                    explanation:
                      "Optionally set the earliest time event goers will be admitted with this ticket.",
                    input: <DatePicker />,
                    required: false,
                    disabled: !!isPublished,
                  },
                  {
                    name: "latestEntryAt",
                    label: "Latest entry",
                    explanation:
                      "Optionally set the latest time event goers will be admitted with this ticket.",
                    input: <DatePicker />,
                    required: false,
                    disabled: !!isPublished,
                  },
                  {
                    name: "isAvailable",
                    label: "Show event to customers",
                    explanation:
                      "Untick this to take your product off of sale. People who have already bought it will still have a ticket.",
                    input: <CheckBox />,
                  },
                ],
              },
            ]}
            onSubmit={handleUpdateProduct}
            submitTitle="Save changes"
          />
          {!isPublished && (
            <div>
              <Spacer y={2} />
              <Popup
                trigger={
                  <div>
                    <MainButton
                      title="Delete"
                      test-id="delete-product-button"
                      buttonTheme={ButtonTheme.DESTRUCTIVE}
                    />
                  </div>
                }
                modal
              >
                {(close) => (
                  <Modal>
                    <h2 className="header-m">Are you sure?</h2>
                    <Spacer y={2} />
                    <p className="text-body-faded">
                      Deleting products can't be reversed, so you'll have to
                      start from scratch if you change your mind.
                    </p>
                    <Spacer y={4} />
                    <MainButton
                      title="Delete product"
                      test-id="confirm-delete-product-button"
                      buttonTheme={ButtonTheme.DESTRUCTIVE}
                      onClick={() => {
                        handleDeleteProduct()
                        close()
                      }}
                    />
                    <Spacer y={2} />
                    <MainButton
                      title="Cancel"
                      test-id="cancel-delete-product-button"
                      buttonTheme={ButtonTheme.MONOCHROME_OUTLINED}
                      onClick={close}
                    />
                  </Modal>
                )}
              </Popup>
            </div>
          )}
          <Spacer y={6} />
      </div>
    </div>
  )
}
