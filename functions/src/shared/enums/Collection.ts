enum Collection {
  // Internal objects
  CLIENT = "Client",
  PAYEE = "Payee",
  PAYMENT_INTENT = "PaymentIntent",
  PAYMENT_ATTEMPT = "PaymentAttempt",
  CHARGE = "Charge",
  REFUND_ATTEMPT = "RefundAttempt",
  LINK = "Link",
  STATE = "State",
  INVITE = "INVITE",
  PHONE = "Phone",
  IP_GEOLOCATION = "IpGeolocation",

  // Objects needed by the online menu client
  MERCHANT = "Merchant",
  MENU_ITEM = "MenuItem",
  MENU_SECTION = "MenuSection",
  ORDER = "Order",
  OPENING_HOUR_RANGE = "OpeningHourRange",
  WEB_AUDIT_LOG = "WebAuditLog",
  TICKET = "Ticket",
  PRODUCT = "Product",
  PRODUCT_RECURRENCE = "ProductRecurrence",
  EVENT = "Event",
  EVENT_RECURRENCE = "EventRecurrence",
  USER = "User",
  MEMBERSHIP = "Membership",
}

export default Collection
