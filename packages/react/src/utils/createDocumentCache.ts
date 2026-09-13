export function createDocumentCache<Value>(
  createValue: (document: Document) => Value,
) {
  const values = new WeakMap<Document, Value>()

  return (document: Document) => {
    if (!values.has(document)) {
      values.set(document, createValue(document))
    }

    return values.get(document) as Value
  }
}
