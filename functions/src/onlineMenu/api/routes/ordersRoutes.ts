import { Router } from "express";
import OrdersController from "../controllers/OrdersController";
import { validate } from "../../../shared/utils/validate";
import { AllowedSchema } from "express-json-validator-middleware";
import { authenticate } from "../../../shared/middleware/authenticate";

const controller = new OrdersController();
const routes = Router();

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
            type: "string"
          },
          quantity: {
            type: "integer",
            minimum: 1,
            maximum: 100
          },
          title: {
            type: "string"
          },
        }
      },
      minItems: 1,
      maxItems: 100
    },
    merchantId: {
      type: "string",
    },
    deviceId: {
      type: "string"
    },
    userId: {
      type: "string"
    }
  }
}

routes.post(
  "/menu", 
  validate({ body: createOrderWithMenuItemsSchema }), 
  controller.createWithMenuItems
);

const createOrderWithTicketsSchema: AllowedSchema = {
  type: "object",
  required: ["productId", "quantity", "deviceId"],
  properties: {
    productId: {
      type: "string"
    },
    quantity: {
      type: "integer"
    },
    deviceId: {
      type: "string"
    }
  }
}

routes.post(
  "/tickets",
  validate({ body: createOrderWithTicketsSchema }),
  authenticate,
  controller.createWithTickets
);

const sendEmailSchema: AllowedSchema = {
  type: "object",
  required: ["email", "orderId"],
  properties: {
    email: {
      type: "string",
      format: "email"
    },
    orderId: {
      type: "string"
    }
  }
}

routes.post(
  "/email-receipt",
  validate({ body: sendEmailSchema }),
  controller.sendEmailReceipt
);

export default routes;
