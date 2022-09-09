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
  const { merchantId, eventId } = useParams()
  const navigate = useNavigate()
  const handleCreateProduct = async (data) => {
    const { title } = data

    const price = parseFloat(data.price) * 100
    const capacity = parseInt(data.capacity, 10)

    const currLargestSortOrder = Math.max(
      ...products.map((product) => product.sortOrder),
      0
    )

    await addDoc(Collection.PRODUCT.ref, {
      eventId,
      merchantId,
      isAvailable: true,
      title,
      price,
      capacity,
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
            formGroupData={[
              {
                explanation:
                  "Configure a ticket type event goers can purchase for your event. You can create multiple ticket types for each event.",
                items: [
                  {
                    name: "title",
                  },
                  // {
                  //   name: "description",
                  //   required: false,
                  //   input: <TextArea />,
                  // },
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
                    label: "Maximum capacity",
                    explanation: "Once this number of tickets has been sold for this ticket type, it will show as sold out.",
                    input: <IntField />,
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
