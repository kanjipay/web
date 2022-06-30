
export async function fetchDocumentsInArray(
  query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>,
  fieldPath: string | FirebaseFirestore.FieldPath,
  valuesArray: any[],
  isPositive: boolean = true
) {
  const promises: Promise<FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>>[] = [];

  let i = 0;
  const chunkSize = 10;

  while (i < valuesArray.length) {
    const valuesArraySlice = valuesArray.slice(i, i + chunkSize);

    const retrieveDocs = query
      .where(fieldPath, isPositive ? "in" : "not-in", valuesArray)
      .get();

    promises.push(retrieveDocs);

    i += valuesArraySlice.length;
  }

  const querySnapshots = await Promise.all(promises);

  return querySnapshots
    .map(snapshot => snapshot.docs)
    .flat()
    .map(doc => {
      const result: any = { id: doc.id, ...doc.data() };

      return result;
    });
}
