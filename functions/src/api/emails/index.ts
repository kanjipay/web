const sendGridMail = require('@sendgrid/mail');
//import * as Handlebars from 'handlebars'
//import * as fs from 'fs'

const FROM_EMAIL = 'oliver@mercadopay.co';

sendGridMail.setApiKey(process.env.SENDGRID_API_KEY);

function createEmailHTML(body){
  return `<strong>${body}</strong>`
}
async function sendEmail(to, subject, text) {
  const html = createEmailHTML(text);
  let emailData = {
    to,
    FROM_EMAIL,
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