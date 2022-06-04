const db = require("../db");
const { v4 } = require("uuid");
const uuid = v4;

// CHANGE THESE TWO VALUES

const collectionName = "Payee";

// data should be of type Object[]
// If you want to specify an id, include it as id: "custom id", else uuid() will be used
const data = [];

const batch = db.batch();
const collectionRef = db.collection(collectionName);

for (const datum in data) {
  let docId;

  if ("id" in datum) {
    docId = datum.id;
    delete datum.id;
  } else {
    docId = uuid();
  }
  const docRef = collectionRef.doc(docId);
  batch.set(docRef, datum);
}

batch.commit().then((res) => {
  console.log(`Insertion to ${collectionName} successful`);
});
