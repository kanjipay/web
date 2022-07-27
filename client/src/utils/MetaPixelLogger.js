import ReactPixel from "react-facebook-pixel"

const metaPixelOptions = {
  autoConfig: true, // More info: https://developers.facebook.com/docs/facebook-pixel/advanced/
  debug: true, // enable logs
}

function alignFacebookGender(mercadoGender) {
  if (mercadoGender == null || mercadoGender == "Not determined") {
    return null
  } else {
    return mercadoGender[0].toLowerCase()
  }
}

function prepareAdvancedMatchingData(user) {
  if (user) {
    // https://developers.facebook.com/docs/meta-pixel/advanced/advanced-matching
    return {
      em: user.email,
      fn: user.firstName,
      ln: user.lastName,
      ge: alignFacebookGender(user.gender),
      external_id: user.email,
    }
  } else {
    return {}
  }
}

export async function logMetaPixelEvent(metaPixelId, user, event, data) {
  const advancedMatchingData = prepareAdvancedMatchingData(user)
  ReactPixel.init(metaPixelId, advancedMatchingData, metaPixelOptions)
  ReactPixel.trackSingle(event, data)
}
