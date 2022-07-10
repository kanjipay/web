export const metaPixelOptions = {
    autoConfig: true, // More info: https://developers.facebook.com/docs/facebook-pixel/advanced/
    debug: true, // enable logs
  }

export function metaPixelAdvancedMatching(user){
    if (user) {
        return metaPixelAdvancedMatching = { em: user.email }
    } else {
        return {}
    }
}
