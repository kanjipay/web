import { loadStripe } from '@stripe/stripe-js';
import { Elements, CheckoutForm } from '@stripe/react-stripe-js';

const stripePromise = loadStripe("pk_live_51Kf7E3JuRwvjx9lyx6mYvTr7oxocUq1nGQIwHq4ZQeFuLK5L8IJDNodlVUgIKeaIGdkMSD2DVh5FDZRgu6MtYjMZ00Gtali513")

export default function StripeCheckoutPage() {
  const options = {
    clientSecret: "sk_test_51Kf7E3JuRwvjx9lymB6xA9hePme7RnvwRw6zsGwe9OV5tmZDp1Ma7VbC1834aM9H3ByzRljaXCM5C0jYPWmRP6Nd00lZRoq4MV"
  }

  return <Elements stripe={stripePromise} options={options}>
    
  </Elements>
}