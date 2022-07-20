const stripe = new require("stripe")("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")

stripe.applePayDomains.create({
  domain_name: "mercadopay.co"
}, {
  stripeAccount: "acct_1LMzki2XZR39FcwX"
}).then(() => {
  console.log("complete")
})