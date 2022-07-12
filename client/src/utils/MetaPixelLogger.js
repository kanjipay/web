import ReactPixel from "react-facebook-pixel"

const metaPixelOptions = {
  autoConfig: true, // More info: https://developers.facebook.com/docs/facebook-pixel/advanced/
  debug: true, // enable logs
}

function prepareAdvancedMatchingData(user) {
  if (user) {
    // https://developers.facebook.com/docs/meta-pixel/advanced/advanced-matching
    return {
      em: user.email,
      fn: user.firstname,
      ln: user.lastname, //could possibly add gender using guesser
      external_id: user.email,
    }
  } else {
    return {}
  }
}

export function logMetaPixelEvent(metaPixelId, user, event, data) {
  advancedMatchingData = prepareAdvancedMatchingData(user)
  ReactPixel.init(metaPixelId, advancedMatchingData, metaPixelOptions).track(
    event,
    data
  )
}
