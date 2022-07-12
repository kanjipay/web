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

export async function logMetaPixelEvent(metaPixelId, user, event, data) {
  console.log('pixel', metaPixelId)
  const advancedMatchingData = prepareAdvancedMatchingData(user)
  console.log('user', user)
  ReactPixel.init(metaPixelId, advancedMatchingData, metaPixelOptions)
  ReactPixel.track(
    event,
    data
  )  
}
