import { addDoc, serverTimestamp } from "firebase/firestore"
import { isMobile } from "react-device-detect"
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
import { getCurrencySymbol } from "../../../../utils/helpers/money"

export default function CreateProductPage({ event, products, merchant }) {
  const { merchantId } = useParams()
  const navigate = useNavigate()
  const handleCreateProduct = async (data) => {
    const { title, description, releasesAt, earliestEntryAt, latestEntryAt } =
      data

    const price = parseFloat(data.price) * 100
    const capacity = parseInt(data.capacity, 10)

    const currLargestSortOrder = Math.max(
      ...products.map((product) => product.sortOrder),
      0
    )

    await addDoc(Collection.PRODUCT.ref, {
      eventId: event.id,
      merchantId,
      isAvailable: true,
      title,
      description,
      price,
      capacity,
      releasesAt,
      earliestEntryAt: earliestEntryAt ?? null,
      latestEntryAt: latestEntryAt ?? null,
      sortOrder: currLargestSortOrder + 1,
      soldCount: 0,
      reservedCount: 0,
      createdAt: serverTimestamp()
    })

    navigate(`..`)
  }

  return (
    <div>
      <Spacer y={2} />
      <Breadcrumb
        pageData={[
          { title: "Events", path: "../.." },
          { title: event.title, path: ".." },
          { title: "Create ticket type" },
        ]}
      />
      <Spacer y={2} />
      <h1 className="header-l">Create ticket type</h1>
      <Spacer y={3} />
      <div style={{ maxWidth: 500 }}>
          <Form
            initialDataSource={{
              releasesAt: new Date(),
            }}
            formGroupData={[
              {
                explanation:
                  "Configure a ticket type event goers can purchase for your event. You can create multiple ticket types for each event.",
                items: [
                  {
                    name: "title",
                  },
                  {
                    name: "description",
                    input: <TextArea />,
                  },
                  {
                    name: "price",
                    input: <FloatField />,
                    decorator: (
                      <FieldDecorator
                        prefix={getCurrencySymbol(merchant.currency)}
                      />
                    ),
                  },
                  {
                    name: "capacity",
                    input: <IntField />,
                  },
                  {
                    name: "releasesAt",
                    label: "Release date",
                    input: <DatePicker />,
                  },
                  {
                    name: "earliestEntryAt",
                    label: "Earliest entry",
                    explanation:
                      "Optionally set the earliest time event goers will be admitted with this ticket.",
                    input: <DatePicker />,
                    required: false,
                  },
                  {
                    name: "latestEntryAt",
                    label: "Latest entry",
                    explanation:
                      "Optionally set the latest time event goers will be admitted with this ticket.",
                    input: <DatePicker />,
                    required: false,
                  },
                ],
              },
            ]}
            submitTitle="Create ticket type"
            onSubmit={handleCreateProduct}
          />
          <Spacer y={6} />
      </div>
    </div>
  )
}
