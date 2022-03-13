const sendGridMail = require('@sendgrid/mail');
//import * as Handlebars from 'handlebars'
//import * as fs from 'fs'

const FROM_EMAIL = 'oliver@mercadopay.co';
console.log('here');
console.log(process.env.SENDGRID_API_KEY);

sendGridMail.setApiKey(process.env.SENDGRID_API_KEY);

function createEmailDetails(orderId: string){
  const subject = `Order ${orderId}`
  const text = `Thank you for ordering order #${orderId}`
  const html = `<strong>${text}</strong>`
  return {subject, text, html}
}
async function sendEmail(toEmail: string, orderId: string) {
  const {subject, text, html} = createEmailDetails(orderId);
  let emailData = {
    to:toEmail,
    from:FROM_EMAIL,
    subject,
    text,
    html,
  };
  console.log(emailData);
  try {
    await sendGridMail.send(emailData);
    console.log('Test email sent successfully');
  } catch (error) {
    console.error('Error sending test email');
    console.error(error);
    if (error.response) {
      console.error(error.response.body)
    }
  }
}
  
export {sendEmail} 