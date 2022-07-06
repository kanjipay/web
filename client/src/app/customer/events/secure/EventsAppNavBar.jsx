import SecureNavBar from "./SecureNavBar"

export default function EventsAppNavBar({
  showsBackButton = true,
  backAction,
  backPath,
  title,
  titleElement,
  leftElements = [],
  rightElements = [],
  transparentDepth,
  opaqueDepth,
}) {
  const props = {
    showsBackButton,
    backAction,
    backPath,
    title,
    titleElement,
    leftElements,
    rightElements,
    transparentDepth,
    opaqueDepth,
    profilePath: "/events/s/tickets",
  }

  return <SecureNavBar {...props} />
}
