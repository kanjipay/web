import * as sendgrid from "@sendgrid/mail";

let sendgridInstance;

function getSendgrid() {
  console.log(process.env.SENDGRID_API_KEY)
  sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
  sendgridInstance = sendgrid;
  return sendgridInstance;
}

export const sendgridClient = () => sendgridInstance || getSendgrid();
