import { Helmet } from "react-helmet-async";
import { ButtonTheme, Colors } from "../../../enums/Colors";
import NavBar from "../../../components/NavBar";
import Spacer from "../../../components/Spacer";
import PaymentOption from "../../checkout/PaymentOption";

export default function PaymentMethodPage({ order }) {
  return (
    <div className="container">
      <Helmet>
        <title>Checkout</title>
      </Helmet>
      <NavBar title="Checkout" backPath={`/menu/${order.merchantId}`} />

      <div className="content">
        <Spacer y={9} />
        <h1 className="header-l">Choose a payment method</h1>
        <Spacer y={3} />

        <div style={{ display: "flex", justifyContent: "right" }}>
          <div
            style={{
              backgroundColor: "#58D68D",
              color: Colors.WHITE,
              padding: "2px 8px",
              marginRight: 16,
              borderRadius: "12px 12px 0 0",
              fontSize: 15,
            }}
          >
            Recommended
          </div>
        </div>

        <PaymentOption
          title="Secure bank transfer"
          body="Securely connect to your bank and pay by bank transfer. This is faster than paying with a card, and it avoids credit card companies charging the merchant a hefty fee."
          buttonTheme={ButtonTheme.PRIMARY}
        />
        <Spacer y={2} />

        <PaymentOption
          title="Debit/credit card"
          body="Enter your card details to pay. The merchant will have to pay higher fees to process the payment."
          buttonTheme={ButtonTheme.SECONDARY}
        />

        <Spacer y={20} />
      </div>
    </div>
  );
}
