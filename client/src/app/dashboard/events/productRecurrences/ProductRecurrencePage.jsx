import { useNavigate, useParams } from "react-router-dom"
import Popup from "reactjs-popup"
import Breadcrumb from "../../../../components/Breadcrumb"
import { ButtonTheme } from "../../../../components/ButtonTheme"
import Form from "../../../../components/Form"
import { TextArea } from "../../../../components/Input"
import { FieldDecorator, FloatField, IntField } from "../../../../components/input/IntField"
import LoadingPage from "../../../../components/LoadingPage"
import MainButton from "../../../../components/MainButton"
import { Modal } from "../../../../components/Modal"
import Spacer from "../../../../components/Spacer"
import TimeIntervalPicker from "../../../../components/TimeIntervalPicker"
import { getCurrencySymbol } from "../../../../utils/helpers/money"
import { NetworkManager } from "../../../../utils/NetworkManager"

export default function ProductRecurrencePage({ eventRecurrence, productRecurrences, merchant }) {
  const { merchantId, eventRecurrenceId, productRecurrenceId } = useParams()
  const navigate = useNavigate()
  const productRecurrence = productRecurrences?.find(pr => pr.id === productRecurrenceId)

  const handleUpdateProductRecurrence = async data => {
    await NetworkManager.put(`/merchants/m/${merchantId}/eventRecurrences/${eventRecurrenceId}/pr/${productRecurrenceId}`, {
      ...data,
      price: parseFloat(data.price) * 100,
      capacity: parseInt(data.capacity, 10)
    })
  }

  const handleDeleteProductRecurrence = async () => {
    await NetworkManager.delete(`/merchants/m/${merchantId}/eventRecurrences/${eventRecurrenceId}/pr/${productRecurrenceId}`)

    navigate("..")
  }

  if (productRecurrence) {
    return <div>
      <Spacer y={2} />
      <Breadcrumb 
        pageData={[
          { title: "Event Schedules", path: "../.." },
          { title: eventRecurrence.title, path: ".." },
          { title: productRecurrence.title },
        ]}
      />
      <Spacer y={3} />
      <h1 className="header-l">{productRecurrence.title}</h1>
      <Spacer y={3} />

      <div style={{ maxWidth: 500 }}>
        <Form 
          initialDataSource={{
            ...productRecurrence,
            price: productRecurrence.price / 100
          }}
          formGroupData={[
            {
              explanation: "Changes to the price of the ticket type will only take effect for events that haven't been published yet.",
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
                  label: "Maximum capacity",
                  explanation: "Once this number of tickets has been sold for this ticket type, it will show as sold out.",
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
              ]
            }
          ]}
          submitTitle="Save changes"
          onSubmit={handleUpdateProductRecurrence}
        />
        <Spacer y={2} />
        <Popup
          trigger={
            <MainButton
              title="Delete ticket type"
              buttonTheme={ButtonTheme.DESTRUCTIVE}
              test-id="delete-event-button"
            />
          }
          modal
        >
          {
            close => <Modal>
              <h2 className="header-m">Are you sure?</h2>
              <Spacer y={2} />
              <p className="text-body-faded">
                Deleting ticket types can't be reversed, so you'll have to start
                from scratch if you change your mind.
              </p>
              <Spacer y={4} />
              <MainButton
                title="Delete ticket type"
                buttonTheme={ButtonTheme.DESTRUCTIVE}
                test-id="confirm-delete-event-button"
                onClick={() => {
                  handleDeleteProductRecurrence()
                  close()
                }}
              />
              <Spacer y={2} />
              <MainButton
                title="Cancel"
                buttonTheme={ButtonTheme.MONOCHROME_OUTLINED}
                test-id="cancel-delete-event-button"
                onClick={close}
              />
            </Modal>
          }
        </Popup>
        <Spacer y={9} />
      </div>
    </div>
  } else {
    return <LoadingPage />
  }
  
}