export function parseHashParams(hash) {
  if (hash === "") {
    return {}
  }

  const hashParams = hash
    .replace("#", "")
    .split("&")
    .reduce((params, paramString) => {
      const [key, value] = paramString.split("=")
      params[key] = value

      return params
    }, {})

  return hashParams
}
