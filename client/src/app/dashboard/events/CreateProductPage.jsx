import { addDoc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "../../../components/Breadcrumb";
import DatePicker from "../../../components/DatePicker";
import Form from "../../../components/Form";
import { TextArea } from "../../../components/Input";
import { FieldDecorator, FloatField, IntField } from "../../../components/input/IntField";
import Spacer from "../../../components/Spacer";
import Collection from "../../../enums/Collection";
import { getCurrencySymbol } from "../../../utils/helpers/money";

export default function CreateProductPage({ event, products, merchant }) {
  const { merchantId } = useParams()
  const navigate = useNavigate()
  const handleCreateProduct = async (data) => {
    const { title, description, releasesAt, earliestEntryAt, lastestEntryAt } = data

    const price = parseFloat(data.price) * 100
    const capacity = parseInt(data.capacity, 10)

    const currLargestSortOrder = Math.max(...products.map(product => product.sortOrder), 0)

    const productRef = await addDoc(Collection.PRODUCT.ref, {
      eventId: event.id,
      merchantId,
      isAvailable: true,
      isPublished: false,
      title,
      description,
      price,
      capacity,
      releasesAt,
      earliestEntryAt: earliestEntryAt ?? null,
      lastestEntryAt: lastestEntryAt ?? null,
      sortOrder: currLargestSortOrder + 1,
      soldCount: 0,
      reservedCount: 0
    })

    const productId = productRef.id

    navigate(`../p/${productId}`)
  }

  return <div>
    <Spacer y={2} />
    <Breadcrumb pageData={[
      { title: "Events", path: "../.." },
      { title: event.title, path: ".." },
      { title: "Create product" }
    ]} />
    <Spacer y={2} />
    <h1 className="header-l">Create product</h1>
    <Spacer y={3} />
    <div style={{ display: "grid", columnGap: 48, gridTemplateColumns: "1fr 1fr" }}>
      <div>
        <Form
          initialDataSource={{
            releasesAt: new Date()
          }}
          formGroupData={[
            {
              explanation: "Your product won't be available to customers immediately. You'll need to publish it first",
              items: [
                {
                  name: "title"
                },
                {
                  name: "description",
                  input: <TextArea />
                },
                {
                  name: "price",
                  input: <FloatField />,
                  decorator: <FieldDecorator prefix={getCurrencySymbol(merchant.currency)} />,
                },
                {
                  name: "capacity",
                  input: <IntField />
                },
                {
                  name: "releasesAt",
                  label: "Release date",
                  input: <DatePicker />,
                },
                {
                  name: "earliestEntryAt",
                  label: "Earliest entry",
                  explanation: "Optionally set the earliest time event goers will be admitted with this ticket.",
                  input: <DatePicker required={false} />,
                  required: false
                },
                {
                  name: "latestEntryAt",
                  label: "Latest entry",
                  explanation: "Optionally set the latest time event goers will be admitted with this ticket.",
                  input: <DatePicker required={false} />,
                  required: false
                },
              ]
            }
          ]}
          submitTitle="Create product"
          onSubmit={handleCreateProduct}
        />
        <Spacer y={6} />
      </div>
    </div>
  </div>
}