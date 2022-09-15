import { db } from "../utils/admin"
import Collection from "../enums/Collection"
import { sendEmail, TemplateName } from "../utils/sendEmail"


export async function SendMerchantWelcome(userId, merchantName){
    const userDoc = await db().collection(Collection.USER).doc(userId).get()
    const {email, firstName} = userDoc.data()
    await sendEmail([email],TemplateName.MERCHANT_WELCOME, {firstName, merchantName})
}