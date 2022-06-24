

export function findElementByTestId(parent, testId: string) {
  return parent.$(`*[test-id="${testId}"]`)
}

export function findElementByTestName(parent, testName: string) {
  return parent.$(`*[test-name="${testName}"]`)
}

export function findElementsByTestName(parent, testName: string) {
  return parent.$$(`*[test-name="${testName}"]`)
}