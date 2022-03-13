import { db } from "../admin";
import Collection from "../enums/Collection";
import { ErrorHandler, HttpError, HttpStatusCode } from "../utils/errors";

export const readOrder = async (req, res, next) => {
  console.log("running read order");
  const { order_id } = req.body;

  const orderDoc = await db
    .doc(`${Collection.ORDER.name}/${order_id}`)
    .get()
    .catch(new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle);

  console.log("got order doc: ", orderDoc);

  if (!orderDoc) {
    next(new HttpError(HttpStatusCode.NOT_FOUND, "Couldn't find that order"));
    return;
  }

  const order = { id: orderDoc.id, ...orderDoc.data() };

  req.order = order;

  next();
};
