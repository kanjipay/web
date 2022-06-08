console.log(process.env.STRIPE_CLIENT_SECRET)

const stripe = require('stripe')(process.env.STRIPE_CLIENT_SECRET);

export default stripe