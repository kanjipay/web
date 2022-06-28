import { deleteDoc, updateDoc } from "firebase/firestore"
import { useNavigate, useParams } from "react-router-dom"
import Breadcrumb from "../../../components/Breadcrumb"
import DatePicker from "../../../components/DatePicker"
import Form from "../../../components/Form"
import { TextArea } from "../../../components/Input"
import { FieldDecorator, FloatField, IntField } from "../../../components/input/IntField"
import Spacer from "../../../components/Spacer"
import Collection from "../../../enums/Collection"
import { dateFromTimestamp } from "../../../utils/helpers/time"
import Popup from 'reactjs-popup';
import MainButton from "../../../components/MainButton"
import { ButtonTheme } from "../../../components/ButtonTheme"
import { Modal } from "./EventPage"
import { getCurrencySymbol } from "../../../utils/helpers/money"
import CheckBox from "../../../components/CheckBox"

export default function ProductPage({ event, products, merchant }) {
  const { productId } = useParams()
  const navigate = useNavigate()
  const product = products.find(p => p.id === productId)
  const docRef = Collection.PRODUCT.docRef(productId)

  const handleUpdateProduct = async (data) => {
    console.log(data)
    await updateDoc(docRef, {
      ...data,
      price: parseFloat(data.price) * 100,
      capacity: parseInt(data.capacity, 10)
    })
  }

  const handleDeleteProduct = async () => {
    await deleteDoc(docRef)
    navigate("../..")
  }

  const handlePublishProduct = async () => {
    await updateDoc(docRef, {
      isPublished: true
    })
  }

  return <div>
    <Spacer y={2} />
    <Breadcrumb pageData={[
      { title: "Events", path: "../..", testId: "events" },
      { title: event.title, path: "..", testId: "event" },
      { title: product.title },
    ]} />
    <Spacer y={2} />
    <h1 className="header-l">{product.title}</h1>
    <Spacer y={4} />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 48 }}>
      <div>
        <h2 className="header-m">Product details</h2>
        <Spacer y={3} />
        <Form
          initialDataSource={{
            ...product,
            releasesAt: dateFromTimestamp(product.releasesAt) ?? new Date(),
            earliestEntryAt: dateFromTimestamp(product.earliestEntryAt),
            latestEntryAt: dateFromTimestamp(product.latestEntryAt),
            price: product.price / 100
          }}
          formGroupData={[{
            explanation: product.isPublished ? "This product is published, so some fields can't be edited, and it can't be deleted." : null,
            items: [
              { name: "title" },
              {
                name: "description",
                input: <TextArea />
              },
              {
                name: "price",
                input: <FloatField maxChars={8} />,
                decorator: <FieldDecorator prefix={getCurrencySymbol(merchant.currency)} />,
                disabled: !!product.isPublished,
              },
              {
                name: "capacity",
                input: <IntField />,
                disabled: !!product.isPublished,
              },
              {
                name: "releasesAt",
                label: "Release date",
                input: <DatePicker />,
                disabled: !!product.isPublished,
              },
              {
                name: "earliestEntryAt",
                label: "Earliest entry",
                explanation: "Optionally set the earliest time event goers will be admitted with this ticket.",
                input: <DatePicker />,
                required: false,
                disabled: !!product.isPublished,
              },
              {
                name: "latestEntryAt",
                label: "Latest entry",
                explanation: "Optionally set the latest time event goers will be admitted with this ticket.",
                input: <DatePicker />,
                required: false,
                disabled: !!product.isPublished,
              },
              {
                name: "isAvailable",
                label: "Show event to customers",
                explanation: "Untick this to take your product off of sale. People who have already bought it will still have a ticket.",
                input: <CheckBox />,
              }
            ]
          }]}
          onSubmit={handleUpdateProduct}
          submitTitle="Save"
        />
        {
          !product.isPublished && <div>
            <Spacer y={2} />
            <Popup
              trigger={<div>
                <MainButton 
                  title="Publish" 
                  test-id="publish-product-button"
                  buttonTheme={ButtonTheme.MONOCHROME_OUTLINED}
                />
              </div>}
              modal
            >
              {
                close => <Modal>
                  <h2 className="header-m">Are you sure?</h2>
                  <Spacer y={2} />
                  <p className="text-body-faded">Once you publish a product, it'll become visible to customers, and you won't be able to edit the price, release date or capacity.</p>
                  <Spacer y={4} />
                  <MainButton 
                    title="Publish product" 
                    test-id="confirm-publish-product-button"
                    onClick={() => {
                      handlePublishProduct()
                      close()
                    }}
                  />
                  <Spacer y={2} />
                  <MainButton 
                    title="Cancel" 
                    test-id="cancel-publish-product-button"
                    buttonTheme={ButtonTheme.MONOCHROME_OUTLINED} 
                    onClick={close}
                  />
                </Modal>
              }
            </Popup>

            <Spacer y={2} />
            <Popup
              trigger={<div>
                <MainButton 
                  title="Delete" 
                  test-id="delete-product-button"
                  buttonTheme={ButtonTheme.DESTRUCTIVE}
                />
              </div>}
              modal
            >
              {
                close => <Modal>
                  <h2 className="header-m">Are you sure?</h2>
                  <Spacer y={2} />
                  <p className="text-body-faded">Deleting products can't be reversed, so you'll have to start from scratch if you change your mind.</p>
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
              }

            </Popup>
          </div>
        }
        <Spacer y={6} />
      </div>
    </div>
  </div>

}