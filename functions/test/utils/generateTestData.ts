import Collection from "../../src/shared/enums/Collection"
import { db } from "./admin"
import { StripeStatus } from "../../src/shared/enums/StripeStatus"
import { addHours } from "date-fns"

export async function createMerchant(
  merchantId: string,
  {
    currency = "GBP",
    customerFee = 0.1,
    approvalStatus = "APPROVED",
    addCrezcoId = true,
  } = {}
) {
  const name = `test merchant`;

  await db
    .collection(Collection.MERCHANT)
    .doc(merchantId)
    .create({
      // variable properties
      currency,
      customerFee,
      approvalStatus,

      // Fixed properties
      displayName: name,
      companyName: name,
      address: "28 Paragon, Bath",
      description: "Some description",
      testData: true,
      sortCode: "000000",
      accountNumber: "12341234",
      ...(addCrezcoId && {
        crezco: {
          userId: "6c8a6c40-b2eb-4538-b833-8d24a86208ff",
        },
      }),
      stripe: {
        accountId: "acct_1L8MJV2Yi582Wuz1",
        status: StripeStatus.CHARGES_ENABLED,
      },
    })
}

export async function createEvent(
  merchantId: string,
  eventId: string,
  {
    isPublished = true,
    maxTicketsPerPerson = 1000,
    startsAt = addHours(new Date(), 4),
    endsAt = addHours(new Date(), 6),
  } = {}
) {
  await db.collection(Collection.EVENT).doc(eventId).create({
    // variable properties
    merchantId,
    isPublished,
    maxTicketsPerPerson,
    startsAt,
    endsAt,

    // Fixed properties
    title: `test event`,
    address: "28 Paragon, Bath",
    description: "Some description",
    testData: true,
  })
}

export async function createProduct(
  merchantId: string,
  eventId: string,
  productId: string,
  // Essential fields
  {
    isAvailable = true,
    reservedCount = 0,
    soldCount = 0,
    capacity = 10000,
    releasesAt = addHours(new Date(), -1),
    price = 1,
  } = {},
  optionalFields = {}
) {
  await db
    .collection(Collection.PRODUCT)
    .doc(productId)
    .create({
      // variable properties
      merchantId,
      eventId,
      isAvailable,
      reservedCount,
      soldCount,
      capacity,
      releasesAt,
      price,
      ...optionalFields,

      // Fixed properties
      title: `test product`,
      description: "Some description",
      testData: true,
    });
}

export async function createLink(
  ticketId: string,
  wasUsed: boolean,
  expiresAt
) {
  await db.collection(Collection.LINK).doc(ticketId).create({
    createdAt: new Date(),
    expiresAt: expiresAt,
    path: "/myPath",
    stateid: "abc123",
    wasUsed: wasUsed,
  })
}

export async function createUser(userId: string) {
  await db.collection(Collection.USER).doc(userId).create({
    email: "test@test.com",
    firstName: "test",
    lastName: "test",
    marketingConsentStatus: "APPROVED",
  })
}

export async function createTicket(
  ticketId: string,
  userId: string,
  eventId: string,
  merchantId: string
) {
  await db.collection(Collection.TICKET).doc(ticketId).create({
    createdAt: new Date(),
    eventEndsAt: new Date(),
    eventId: eventId,
    hash: "1234",
    merchantId,
    orderId: "1234",
    productId: "1234",
    userId,
    wasUsed: false,
  })
}

export async function createMembership(
  merchantId: string,
  userId: string,
  membershipId: string
) {
  await db.collection(Collection.MEMBERSHIP).doc(membershipId).create({
    merchantId,
    userId,
    merchantName: "Test",
    role: "ADMIN",
    lastUsedAt: new Date(),
  })
}

export async function createTicketOrder(
  orderId: string,
  total: number,
  merchantId: string
) {
  await db.collection(Collection.ORDER).doc(orderId).create({
    createdAt: new Date(),
    currency: "GBP",
    customerFee: 0.1,
    deviceId: "123-abc",
    eventId: "test",
    merchantId,
    status: "PENDING",
    total,
    type: "TICKETS",
    userId: "test",
    wereTicketsCreated: false,
  })
}
