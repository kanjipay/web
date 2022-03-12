enum FireStoreCollection {
  MERCHANT = "Merchant",
  MENU_ITEM = "MenuItem",
  MENU_SECTION = "MenuSection",
  ORDER = "Order",
  PAYMENT_ATTEMPT = "PaymentAttempt",
  OPENING_HOUR_RANGE = "OpeningHourRange",
}

enum Environment {
  DEV = "DEV",
  PROD = "PROD",
}

enum MerchantStatus {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
}

enum OrderStatus {
  PENDING = "PENDING",
  ABANDONED = "ABANDONED",
  CANCELLED = "CANCELLED",
  PAID = "PAID",
}

enum PaymentAttemptStatus {
  PENDING = "PENDING",
  CANCELLED = "CANCELLED",
  FAILED = "FAILED",
  SUCCESSFUL = "SUCCESSFUL",
}

export {
  FireStoreCollection,
  Environment,
  MerchantStatus,
  OrderStatus,
  PaymentAttemptStatus,
};
