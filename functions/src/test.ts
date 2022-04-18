import { validator } from "great-json-validator";

/**
 * Define a JSON schema.
 */
const addressSchema = {
  type: "object",
  required: ["street"],
  properties: {
    street: {
      type: "string",
    }
  },
};

const data = {
    'street':'lamb street'
}


console.log(validator(addressSchema, data));

