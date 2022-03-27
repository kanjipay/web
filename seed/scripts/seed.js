const db = require("../db");
const merchants = require("../seedData/merchants");
const menuItems = require("../seedData/menuItems");
const menuSections = require("../seedData/menuSections");
const openingHourRanges = require("../seedData/openingHourRanges");
const orders = require("../seedData/orders");
const paymentAttempts = require("../seedData/paymentAttempts");

// Load all the data into an object {CollectionName: items}
// Note out collections you don't want to seed
const collectionMap = {
  Merchant: merchants,
  MenuSection: menuSections,
  MenuItem: menuItems,
  OpeningHourRange: openingHourRanges,
  Order: orders,
  PaymentAttempt: paymentAttempts,
};

let argv = require("minimist")(process.argv.slice(2));
const seededNamesString = argv.o || argv.only;

let seededCollectionNames;

if (seededNamesString) {
  seededCollectionNames = seededNamesString.split(",");
  console.log(seededCollectionNames);
}

// Iterate through each collection
for (const [collectionName, items] of Object.entries(collectionMap)) {
  if (
    seededCollectionNames &&
    !seededCollectionNames.includes(collectionName)
  ) {
    continue;
  }

  const batch = db.batch();
  const collectionRef = db.collection(collectionName);

  // First, retrieve all existing documents in the collection
  collectionRef.get().then((snapshot) => {
    // Then, mark each for deletion
    snapshot.docs.forEach((doc) => {
      console.log(doc.id);
      const docRef = collectionRef.doc(doc.id);
      batch.delete(docRef);
    });

    // Add the seed data to the batch
    for (const item of items) {
      const docRef = collectionRef.doc(item.id);
      batch.set(docRef, item.data);
    }

    batch.commit().then((res) => {
      console.log(`${collectionName} seeded`);
    });
  });
}
