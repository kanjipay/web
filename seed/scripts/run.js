const db = require("../db");
const { v4 } = require("uuid");
const uuid = v4;

const collectionsToSeed = [
  "Merchant",
  "Event",
  "Product",
]

const collectionsToClear = [
  // "PaymentIntent",
  // "PaymentAttempt",
  // "Order",
  // "Ticket"
]

const collectionsToDelete = [...new Set(collectionsToSeed.concat(collectionsToClear))]

const batch = db.batch()

const fetchCollections = collectionsToDelete.map(collectionName => {
  return db.collection(collectionName).get()
})

Promise.all(fetchCollections)
  .then(snapshots => {
    snapshots.forEach((snapshot, index) => {
      const collectionName = collectionsToDelete[index]
      const collectionRef = db.collection(collectionName)

      snapshot.docs.forEach(doc => {
        const docRef = collectionRef.doc(doc.id);
        batch.delete(docRef);
      })

      if (collectionsToSeed.includes(collectionName)) {
        const data = require(`../seedData/${collectionName}`)

        for (const datum of data) {
          let id
          const datumId = datum.id

          if (datumId) {
            id = datumId
            delete datum.id
          } else {
            id = uuid()
          }

          const docRef = collectionRef.doc(id);
          batch.set(docRef, datum);
        }
      }
    })

    return batch.commit()
  })
  .then(() => {
    console.log("Done")
  })