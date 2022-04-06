const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function createPaymentAttemptIntents(orderAmount) {
    const paymentIntents = await stripe.paymentIntents.create({
        amount:orderAmount,
        currency: "gbp",
        automatic_payment_methods: {
          enabled: true,
        },
      })
    return paymentIntent.client_secret;
  }