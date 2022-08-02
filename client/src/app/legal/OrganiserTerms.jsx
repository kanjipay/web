import { organiserTermsVersion } from "../../utils/constants"
import { LegalDocument } from "./LegalDocument"

export default function OrganiserTerms() {
  return <LegalDocument data={{
    title: "Terms and Conditions",
    version: organiserTermsVersion,
    definitions: [
      {
        title: "Terms",
        description: "This agreement, defining an Organiser’s terms of service."
      },
      {
        title: "Customer",
        description: "An individual who books tickets for an Event using our Platform."
      },
      {
        title: "Organiser",
        description: "Supplier of Event services to customers.This could be a promoter, venue, performer, society or organisation.They are responsible for marketing the event, and supplying the promised services to Customers."
      },
      {
        title: "Intellectual Property",
        description: "Software, inventions, copyright and trademarks of the Platform, throughout the world and in the future."
      },
      {
        title: "We, us, our",
        description: "Kanjipay LTD trading as Mercado."
      },
      {
        title: "You, your",
        description: "The Organiser who is agreeing to these terms."
      },
      {
        title: "Platform",
        description: "The Mercado website application."
      },
      {
        title: "Event",
        description: "Music performances, or other events, with ticket administration organised using the Platform."
      },
      {
        title: "User Generated Content",
        description: "Images, text and other content uploaded by Organisers to the Platform."
      },
      {
        title: "GDPR",
        description: "the General Data Protection Regulation (EU) 2016/679."
      },
      {
        title: "Tickets",
        description: "A record containing the customer and product details for a Customer.Tickets can be uniquely identified by their ‘ID number’ and QR code and are sent to Customers by email."
      },
      {
        title: "Booking fee",
        description: "The fee customers are charged beyond a ticket’s face value, to cover costs to you, and us, of creating and processing customer bookings."
      },
      {
        title: "Organiser Booking fee rebate",
        description: "The share of booking fees we rebate to organisers. We agree to rebate 75% of booking fees for Open Banking payments, and 50% for Card payments."
      },
      {
        title: "Mercado Booking fee share",
        description: "The share of booking fees we do not rebate to organisers. 25%  booking fees for OpenBanking payments (2.5% of ticket face value) and 50% for Card payments (5% of ticket face value)."
      },
      {
        title: "Open Banking Payment",
        description: "A Customer pays by bank - transfer, with amount and transaction references and payment confirmation being automatically populated."
      },
      {
        title: "Card Scheme Payment",
        description: "Customer pays using an online card payment, including digital wallets such as Apple Pay and Google Pay."
      },
      {
        title: "Scanning Equipment",
        description: "A phone / tablet with internet connection, able to login to your organisation."
      },
    ],
    sections: [
      {
        title: "Use of the Mercado Platform",
        clauses: [
          "In creating an Organiser account, creating Events and selling Tickets, you are subject to these Terms and agree to be bound by them.We are granting you a limited license to use this Platform, in accordance with these Terms.",
          "All information you provide, including during registration on the Platform, is accurate and up - to - date.If this information changes, you will promptly notify us. ",
          "Anyone using the Platform using your log -in details must comply with these Terms.You will not share your login details with anyone outside of your registered Organisation.",
          "When interacting with Customers, you will not cause harm to them with with your actions, and will not behave in a unlawful, threatening, harassing, discriminatory manner.",
          "When organising and marketing Events, you will comply with all relevant laws and regulations.",
          "When organising and marketing Events, you will have all permission and authority to hold the events as advertised to the Customer",
          "You will not take actions which can reasonably be interpreted to be capable of damaging our reputation.",
          "You will not use the Platform in any way that causes it to be impaired, or for functionality to be lost or degraded.",
          "You will not run harmful computer programs, to interfere with, interrupt or disrupt the normal operating of our Platform.",
          "You will not attempt to gain unauthorised access to any parts of the Platform, or attempt to access the accounts or information of other users.",
          "You will not use the Platform in any manner which infringes the rights of any person or company(including intellectual property rights, or rights of confidentiality).",
          "You will not use the Platform to upload content which is obscene, defamatory, harassing, threatening or abusive to anyone.",
          "You will not use the Platform to display, link to, or advertise third party ticketing services.",
          "We disclaim any liability in monitoring or controlling the content of the Platform.",
          "Your Events must be delivered in an acceptable and safe manner, providing all advertised services to Customers for all events to an acceptably high level of quality.",
          "We reserve the right to revoke your access to the Platform, if you have failed to comply with the Terms.",
        ]
      },
      {
        title: "Our services",
        clauses: [
          "We act as your agent in facilitating the sale of Tickets to Events.We do not purchase Tickets, set Ticket prices, determine seating at Events or carry out marketing and sales activities.Our only responsibility is to collect funds from Customers, on your behalf, provide Customers with Tickets, and you with Customers’ booking details.Customer booking details are provided to you for the sole purpose of enabling you to administer the Event.",
          "You retain ownership of all tickets and the rights to grant entry to Events at all times, and this does not pass to us in any circumstances.",
          "We are not responsible for the actions of Customers.Any contract for the provision of services at Events is between you and the Customer.We are not the creator, organiser or owner of the Events. ",
          "We disclaim all responsibility or liability for the running of an Event.You agree that you are solely responsible for ensuring that any Event meets all applicable laws, rules and regulations. ",
        ]
      },
      {
        title: "Our obligations",
        clauses: [
          "We do not guarantee that all of the tickets you list for Events will be purchased.We do not take responsibility for marketing your Events.",
          "We retain the right to alter the UX and design of the Platform.",
          "We retain the right to remove events from display on the Platform at any time, giving you reasonable notice.",
          "In addition to the face value of a ticket, Customers pay a booking fee as payment for the services provided by us, and yourself, in distributing and processing the tickets  The booking fee will be clearly itemised as a separate charge from the face value of the ticket.",
          "We agree to share a fixed proportion of this fee with you, as specified in our Booking fee rebates, to cover costs you face in creating, issuing and checking tickets for events.",
          "We will obtain payment from the Customer of the face value of a ticket, as set by you, and will forward the full face value of all sold tickets to you(see below) as well as the agreed Organiser Booking fee rebate in accordance with our payment terms.",
          "Beyond the agreed “Mercado share of booking fees”, we will not charge you for the service provided in accordance with these Terms, unless otherwise agreed.",
          "Subject to the other provisions of these Terms, we will not sell tickets for more than the agreed face value and Booking fee.",
          "We give no guarantees that the Platform will be fault - free or that the services provided will be uninterrupted. ",
          "We will occasionally restrict your access to the Platform to carry out repairs and maintenance. ",
        ]
      },
      {
        title: "Your obligations",
        clauses: [
          "You must be authorised to appoint us as an agent for your Events.",
          "You must provide accurate information for all Events listed on the Platform.",
          "You must make Customers aware of any requirements for entry and any additional restrictions and / or conditions for an Event.",
          "You must provide accurate information on the face value of all tickets.",
          "You must ensure that competent personnel are in possession of Scanning Equipment and a printed list of ticket purchaser details at Events.",
          "You must grant holders of Mercado Tickets efficient entry to your events.",
          "You must make best efforts to accommodate late arrivals to Events.",
          "You must not admit any person who cannot confirm to a reasonable level of satisfaction that they are the ticket holder.",
          "You must not admit any person who we inform you has obtained a Mercado Ticket fraudulently.",
          "You must accept our payment terms(as set out below), and provide bank details so that payment can be made to you electronically.",
          "Any dispute or complaint regarding the content or quality of your Event, your actions or inactions, or those of your performers, staff and representatives, is between you and the Customer.",
          "You will assist us in investigating any complaints made against you by a Customer.",
          "The total number of tickets you sell for an event must not exceed the legal capacity for the Event, or the physical capacity where you are able to provide Customers an acceptable level of quality.",
        ]
      },
      {
        title: "Pricing, fees and payment terms",
        clauses: [
          "We will not charge you any fees for subscription or usage, beyond our agreed Mercado share of booking fees.",
          "Tickets may be sold through the Platform at a price determined by you. ",
          "We will pay you the total face value of Tickets sold by us on the Platform for each Event, as well as your agreed share of all booking fees",
          "We pay by bank transfer directly to your nominated account.It is your responsibility to give us your correct bank details and payment will not be made to you until we have received such details. ",
          "We accept no liability for payments that are lost as a result of you giving us incorrect bank details. ",
          "We will not add VAT to, or deduct VAT from, the face value of the Tickets. ",
          "It is your responsibility to pay any VAT due on the sale of Tickets. If you are registered for VAT, you agree to provide a VAT receipt to Customers who request one.",
          "All monies remitted to you shall be inclusive of VAT and you will not charge us VAT in respect of these.It will be your responsibility to discharge any VAT obligation in respect of the amount remitted to you. ",
          "We will account for and pay any VAT due on our portion of the booking fee.When we remit part of the booking fee to you, This will be inclusive of VAT on that amount.It will be your responsibility to discharge any VAT obligation in respect of the amount remitted to you. ",
          "If a Ticket is sold via CardPayment, both the face value of the ticket and, and your share of the booking fee, will be remitted to you.",
          "If tickets are sold via CardPayment, you will receive funds according to the payout schedule of our payment processor, Stripe. This is typically within 7 days of a ticket being sold.",
          "If tickets are sold via OpenBanking, we will transfer funds from ticket sales directly to your account, invoicing you for our share of Booking Fees as outlined in the Commercial Agreement.",
          "You must pay any share of booking fees owed to us within 7 days of the event.",
          "Payment by us is without prejudice to any claims or rights which we may have against you and shall not constitute any admission by us to the performance by you of your obligations under these Terms.Prior to making such payment, we shall be entitled to make deductions or deferments in respect of any disputes or claims whatsoever with or against you.",
          "Any debit or credit card chargebacks, refund charges or other card scheme charges(except if they are caused by our negligence or misconduct) occurring on Tickets purchased for one of your Events’ are your responsibility.You agree to promptly and fully reimburse us for such amounts on demand. ",
          "We retain the right to withhold payment to you of the proceeds from ticket sales to offset our liabilities arising from any of the costs listed in 5.14 or 5.18",
          "We will use reasonable efforts to manage chargebacks and reversals on your behalf.",
          "We will only process refunds where we have enough funds on account to do. If you have been paid Ticket sales proceeds and refunds are required, you must either transfer funds to us so that we can process these refunds on your behalf, or you will need to directly refund Customers. ",
          "We disclaim all responsibility for making refunds unless there is proven error on our part. If you do not refund Customers directly and do not remit funds back to us to enable refunds, and Customers proceed to cancel ticket purchases with their bank or card company, you agree to fully indemnify us for any losses suffered as a result, including the full face - value of the ticket purchased, any dispute or chargeback fees and our share of the booking fees on the canceled tickets. ",
          "We may recover such losses by way of direct invoice or by withholding any ticket sales proceeds payable to you.",
        ]
      },
      {
        title: "Intellectual Property and right to use",
        clauses: [
          "You acknowledge and agree that all Intellectual Property in all material or content contained within the Platform shall remain at all times owned by us or our licensors. ",
          "You do not acquire any ownership rights by downloading or using the Platform or content from the Platform.",
          "You agree that by submitting any content, information, images or otherwise for publication on the Platform, you retain any copyright you may have, however you grant us a perpetual, irrevocable, worldwide, non - exclusive, royalty - free and fully sub - licensable right and license to use, reproduce, edit, modify, adapt, publish, translate, create derivative works from, distribute, perform and display such content(in whole or in part) and / or to incorporate it into other work.",
          "You are solely responsible for your User Generated Content(including content you share with other sites, such as social networking sites) and we do not endorse User Generated Content or any opinion, recommendation, or advice expressed therein, and we expressly disclaim any and all liability in connection with User Generated Content.",
        ]
      },
      {
        title: "Data Processing",
        clauses: [
          "Each party shall comply at all times with GDPR and shall not perform its obligations under these Terms in such a way as to cause the other to breach the regulations.",
          "You will act as “processor” to Mercado who will be “controller” as defined by GDPR.",
          "You will not use personal data for purposes not outlined in these Terms, unless you have a lawful basis for doing so.",
          "You will only permit personal data to be processed by persons who are bound by enforceable obligations of confidentiality.",
          "You will protect personal data against unauthorised processing and accidental loss.",
          "Where you appoint a third party sub - processor, you shall ensure that they also abide by GDPR regulations.",
          "You will promptly inform us of a personal data breach suffered by you and provide all necessary cooperation needed for us to comply with GDPR.",
          "Upon termination of these Terms, unless you have a valid and lawful basis not to, you will promptly  delete all personal data.",
          "You shall indemnify us for any losses, damage, liabilities, or other expense incurred(whether foreseeable or unforeseeable or direct or indirect) as a result of you breaching your obligations under this clause 7(Data Processing).",
        ]
      },
      {
        title: "Limitation of Liability",
        clauses: [
          "We shall not be liable under any circumstances with respect to any services provided under the Platform, or any other subject matter of these Terms, for: (i) any indirect losses, meaning a loss to you which is a side effect of the main loss or damage and where you and we could not have reasonably foreseen that type of loss arising at the time of entering into these Terms; (ii) losses not caused by our breach; (iii) the actions or inactions of Customers; and(iv) any matters beyond our reasonable control(including network failure).",
          "We expressly exclude liability for any damage, injury, harm or loss(to people or property) which may arise at an Event run by you.",
          "We expressly exclude liability for any Tickets or other goods provided by third party suppliers to the fullest extent permitted by law.",
          "We shall not be liable for the contents  of any information that you provide to us, or the content of any other user of the Platform.",
          "We are not affiliated with, and have no agency or employment relationship with, any third party service provider used to provide services under the Platform and we have no responsibility for and disclaim all liability arising from, the acts or omissions of any such third party service provider.",
          "We accept liability for death or personal injury caused by our negligence or that of our employees and agents.We do not seek to exclude liability for fraudulent misrepresentation by us or our employees or agents.",
          "Nothing in these Terms shall exclude any liability we may have at law.Nothing in these Terms is intended to affect these statutory rights. ",
          "If we breach these Terms, we shall only be liable for losses which are a reasonably foreseeable consequence of such a breach, up to a maximum of £500.",
        ]
      },
      {
        title: "Termination",
        clauses: [
          "We may terminate these Terms and close any account you have with us by giving you 30 days’ notice by email. ",
          "We may terminate these Terms and close your account without notice if you breach any of your obligations under these Terms, or if court or bankruptcy proceedings are brought against you. ",
          "Termination shall not limit our right to take any other action against you that we consider appropriate to defend our rights or those of any other person.",
          "Termination shall not prejudice any other right or remedy you or we may have in respect of accrued rights(including rights in respect of any breach) or liabilities which arose prior to termination.",
          "You are under no obligation to use the Platform and may simply choose to stop using it at any time.",
        ]
      },
      {
        title: "General",
        clauses: [
          "These Terms are not intended to give rights to anyone except you and us, unless otherwise expressly indicated by us within these Terms.We may assign our rights and obligations under these Terms without your prior consent to any new provider of the Platform.",
          "These Terms and the relationship between you and us shall be governed by the laws of England and Wales without regard to its conflict of law provisions.You and we agree to submit to the jurisdiction of the courts of England and Wales.",
          "If any provision of these Terms is found to be unlawful, void, or for any reason unenforceable, then the provision will be deleted.Any such deletion will not affect the validity and enforceability of any of the other provisions of these Terms.",
        ]
      },
    ]
  }} />
}
