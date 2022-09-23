export enum CaseType {
  CAMEL = "CAMEL",
  KEBAB = "KEBAB",
  WORD = "WORD",
  SNAKE = "SNAKE",
  SCREAM = "SCREAM",
}

export function switchCase(value: string, fromCase: CaseType, toCase: CaseType) {
  if (fromCase === toCase) { return value }
  switch (toCase) {
    case CaseType.CAMEL:
      function toCamelCase(separator: string) {
        return value.split(separator).map((w, index) => {
          if (index === 0) {
            return w.toLowerCase()
          } else {
            return w[0].toUpperCase() + w.slice(1).toLowerCase()
          }
        }).join("")
      }

      switch (fromCase) {
        case CaseType.KEBAB:
          return toCamelCase("-")
        case CaseType.WORD:
          return toCamelCase(" ")
        case CaseType.SNAKE:
          return toCamelCase("_") 
        case CaseType.SCREAM:
          return toCamelCase("_") 
      }
    case CaseType.KEBAB:
      switch (fromCase) {
        case CaseType.CAMEL:
          return value.replace(/[A-Z]/g, l => `-${l.toLowerCase()}`)
        case CaseType.WORD:
          return value.replace(/ /g, "-").toLowerCase()
        case CaseType.SNAKE:
          return value.replace(/_/g, "-")
        case CaseType.SCREAM:
          return value.replace(/_/g, "-").toLowerCase()
      }
    case CaseType.WORD:
      switch (fromCase) {
        case CaseType.CAMEL:
          return value[0].toUpperCase() + value.slice(1).replace(/[A-Z]/g, l => ` ${l.toLowerCase()}`)
        case CaseType.KEBAB:
          return value[0].toUpperCase() + value.slice(1).replace(/-/g, " ")
        case CaseType.SNAKE:
          return value[0].toUpperCase() + value.slice(1).replace(/_/g, " ")
        case CaseType.SCREAM:
          return value[0].toUpperCase() + value.slice(1).toLowerCase().replace(/_/g, " ")
      }
    case CaseType.SNAKE:
      switch (fromCase) {
        case CaseType.CAMEL:
          return value.replace(/[A-Z]/g, l => `_${l.toLowerCase()}`)
        case CaseType.KEBAB:
          return value.replace(/-/g, "_")
        case CaseType.WORD:
          return value.replace(/ /g, "_").toLowerCase()
        case CaseType.SCREAM:
          return value.toLowerCase()
      }
    case CaseType.SCREAM:
      switch (fromCase) {
        case CaseType.CAMEL:
          return value.replace(/[A-Z]/g, l => `_${l}`).toUpperCase()
        case CaseType.KEBAB:
          return value.toUpperCase().replace(/-/g, "_")
        case CaseType.WORD:
          return value.replace(/ /g, "_").toUpperCase()
        case CaseType.SNAKE:
          return value.toUpperCase()
      }
  }
}