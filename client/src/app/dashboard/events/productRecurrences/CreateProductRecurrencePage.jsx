import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../../../components/Breadcrumb";
import Form from "../../../../components/Form";
import { TextArea } from "../../../../components/Input";
import { FieldDecorator, FloatField, IntField } from "../../../../components/input/IntField";
import Spacer from "../../../../components/Spacer";
import TimeIntervalPicker from "../../../../components/TimeIntervalPicker";
import { TimeInterval } from "../../../../enums/TimeInterval";
import { getCurrencySymbol } from "../../../../utils/helpers/money";
import { NetworkManager } from "../../../../utils/NetworkManager";

export default function CreateProductRecurrencePage({ merchant, eventRecurrence }) {
  const navigate = useNavigate()

  const handleCreateTicketType = async data => {
    const productRecurrenceData = {
      ...data,
      price: parseFloat(data.price) * 100,
      capacity: parseInt(data.capacity, 10)
    }

    await NetworkManager.post(
      `/merchants/m/${merchant.id}/eventRecurrences/${eventRecurrence.id}/pr`, 
      productRecurrenceData
    )

    navigate("..")
  }

  return <div>
    <Spacer y={2} />
    <Breadcrumb 
      pageData={[
        { title: "Events", path: "../.." },
        { title: eventRecurrence.title, path: ".." },
        { title: "Create ticket type"}
      ]}
    />
    <Spacer y={2} />
    <h1 className="header-l">Create ticket type</h1>
    <Spacer y={4} />

    <div style={{ maxWidth: 500 }}>
      <Form 
        initialDataSource={{
          releaseDateInterval: {
            interval: TimeInterval.WEEK,
            amount: 2
          }
        }}
        formGroupData={[
          {
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
                name: "releaseDateInterval",
                label: "Release date",
                explanation: "This is when this ticket type goes on sale.",
                input: <TimeIntervalPicker
                  suffix="before the event starts" 
                />,
              },
              // Should have something for latest and earliest entry times
            ]
          }
        ]}
        onSubmit={handleCreateTicketType}
        submitTitle="Create ticket type"
      />
      <Spacer y={9} />
    </div>
  </div>
}