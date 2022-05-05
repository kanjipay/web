const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function createUserLink(refresh_url, return_url){
    const {id} = await stripe.accounts.create({
        type: 'standard',
    });
    const accountLink = await stripe.accountLinks.create({
        account:id,
        refresh_url,
        return_url,
        type: 'account_onboarding',
      });
    /*
      Todo work out merchant onboarding info. 
    */
    return accountLink
}

export async function createPaymentIntents(connectedAccountId, orderAmount, mercadoFeeAmount) {
    return stripe.paymentIntents.create({
        amount: orderAmount,
        currency: 'gbp',
        payment_method_types: ['card'],
        application_fee_amount: mercadoFeeAmount,
        on_behalf_of:connectedAccountId,
        transfer_data: {
          destination:connectedAccountId,
        },
    });
}