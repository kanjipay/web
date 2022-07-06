import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_CLIENT_SECRET, {
  apiVersion: null,
})

export default stripe
