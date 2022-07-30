import { Router } from "express"
import { OrdersController } from "../controllers/OrdersController"
import { validate } from "../../../shared/utils/validate"
import { AllowedSchema } from "express-json-validator-middleware"
import { authenticate } from "../../../shared/middleware/authenticate"

const ordersController = new OrdersController()
const ordersRoutes = Router()

const createOrderWithMenuItemsSchema: AllowedSchema = {
  type: "object",
  required: ["requestedItems", "merchantId", "deviceId", "userId"],
  properties: {
    requestedItems: {
      type: "array",
      items: {
        type: "object",
        required: ["quantity", "id", "title"],
        properties: {
          id: {
            type: "string",
          },
          quantity: {
            type: "integer",
            minimum: 1,
            maximum: 100,
          },
          title: {
            type: "string",
          },
        },
      },
      minItems: 1,
      maxItems: 100,
    },
    merchantId: {
      type: "string",
    },
    deviceId: {
      type: "string",
    },
    userId: {
      type: "string",
    },
  },
}

ordersRoutes.post(
  "/menu",
  validate({ body: createOrderWithMenuItemsSchema }),
  ordersController.createWithMenu
)

const createOrderWithTicketsSchema: AllowedSchema = {
  type: "object",
  required: ["productId", "quantity", "deviceId"],
  properties: {
    productId: {
      type: "string",
    },
    quantity: {
      type: "integer",
    },
    deviceId: {
      type: "string",
    },
  },
}

ordersRoutes.put("/o/:orderId/enrich", authenticate, ordersController.enrich)

ordersRoutes.put("/o/:orderId/abandon", authenticate, ordersController.abandon)

ordersRoutes.post(
  "/tickets",
  validate({ body: createOrderWithTicketsSchema }),
  authenticate,
  ordersController.createWithTickets
)

const sendEmailSchema: AllowedSchema = {
  type: "object",
  required: ["email", "orderId"],
  properties: {
    email: {
      type: "string",
      format: "email",
    },
    orderId: {
      type: "string",
    },
  },
}

ordersRoutes.post(
  "/email-receipt",
  validate({ body: sendEmailSchema }),
  ordersController.sendMenuReceipt
)

export default ordersRoutes
