export function enumValues(enumType) {
  return Object.keys(enumType).filter((key) => {
    return isNaN(Number(key))
  })
}
