export function createDocumentManager<Manager>(
  createManager: (document: Document) => Manager,
) {
  const managers = new WeakMap<Document, Manager>()

  return (document: Document) => {
    let manager = managers.get(document)

    if (!manager) {
      manager = createManager(document)
      managers.set(document, manager)
    }

    return manager
  }
}
