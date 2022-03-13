import * as sgMail from '@sendgrid/mail'
import * as Handlebars from 'handlebars'
import * as fs from 'fs'

// const fromEmail = 'oliver@mercadopay.co'

export async function sendEmail(toEmail, subject, templateName, context) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const test = fs.readFileSync("./test.txt").toString('utf-8')
  console.log(test)
  const htmlString = fs.readFileSync(`./templates/${templateName}.handlebars`).toString('utf-8');
  console.log(htmlString)
  const template = Handlebars.compile(htmlString)
  const result = template(context)

  console.log(result)

  return


  // const msg = {
  //   to: toEmail, // Change to your recipient
  //   from: fromEmail, // Change to your verified sender
  //   subject,
  //   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
  // }

  // const sgResponse = await
  // sgMail.send(msg)
  //   .catch(new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle)
}