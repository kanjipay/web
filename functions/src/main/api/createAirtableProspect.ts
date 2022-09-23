import axios from "axios"
import { CaseType, switchCase } from "../../shared/utils/switchCase"

// enum ProspectField {
//   NAME = "fldDIzRmmKoJb05tK",
//   SOURCE = "fldijpmRxzspyxE7d",
//   NOTES = "fldXXOfe5UBVGoHek",
//   COMPANY = "fldmSWq4wsXWPMvXG",
//   SEGMENT = "fldp3OmKnjgfx9XlR",
//   EMAIL = "fld21qHYrJUC78edA",
//   STATUS = "fldDMkqjN357WPmt7",
//   ASSIGNEE = "fldPe0czrqWC61YWo",
// }

export const createAirtableProspect = async (req, res, next) => {
  try {
    console.log(process.env.AIRTABLE_API_KEY)
    const { name, email, segment: segmentFromForm, company, notes } = req.body
    const url = "https://api.airtable.com/v0/appPVE39SxSMa0nW1/tblnx4sOYdB4K0X2H"
    const headers = { 
      "Authorization": `Bearer ${process.env.AIRTABLE_API_KEY}`,
      "Content-Type": "application/json"
    }

    const segment = switchCase(segmentFromForm, CaseType.SCREAM, CaseType.WORD)

    console.log(segment)

    const data = {
      fields: {
        name,
        email,
        segment,
        company,
        notes,
        source: "Contact form",
        status: "Hooked",
        assignee: {
          id: "usrvZK04Mj9MZkB2t",
          email: "matt@mercadopay.co",
          name: "Matthew Ffrench"
        },
      }
    }

    await axios.post(url, data, { headers })

    res.sendStatus(200)
  } catch (err) {
    next(err)
  }
}

