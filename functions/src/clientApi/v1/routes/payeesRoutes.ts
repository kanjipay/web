import { Router } from "express";
import { validate } from "../../../shared/utils/validate";
import PayeesController from "../controllers/PayeesController";
import { AllowedSchema } from "express-json-validator-middleware";

const payeesRouter = Router()
const payeesController = new PayeesController()

const createPayeeSchema: AllowedSchema = {
  type: "object",
  required: [
    "companyName", 
    "sortCode", 
    "accountNumber", 
    "address"
  ],
  properties: {
    companyName: {
      type: "string",
    },
    companyNumber: {
      type: "string",
    },
    sortCode: {
      type: "string",
      minLength: 6,
      maxLength: 6,
      pattern: "^[0-9]*$"
    },
    accountNumber: {
      type: "string",
      minLength: 5,
      maxLength: 8,
      pattern: "^[0-9]*$"
    },
    address: {
      type: "string",
    },
  }
}

const showPayeeParamsSchema: AllowedSchema = {
  type: "object",
  required: ["payeeId"],
  properties: {
    payeeId: {
      type: "string",
    }
  }
}

const indexPayeesQueryParamsSchema: AllowedSchema = {
  type: "object",
  properties: {
    limit: {
      type: "integer",
      minimum: 1,
      maximum: 500
    }
  }
}

payeesRouter.post("/", validate({ body: createPayeeSchema }), payeesController.create)
payeesRouter.get("/:payeeId", validate({ params: showPayeeParamsSchema }), payeesController.show)
payeesRouter.get("/", validate({ query: indexPayeesQueryParamsSchema }), payeesController.index)


export default payeesRouter