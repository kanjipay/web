export function filterObjectKeys(obj: any, keys: string[]) {
    return Object.keys(obj).reduce((currObj, key) => {
      currObj[key] = obj[key]
      return currObj
    }, {})
  }
  