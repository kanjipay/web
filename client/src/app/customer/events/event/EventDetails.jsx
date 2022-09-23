import Clock from "../../../../assets/icons/Clock";
import User from "../../../../assets/icons/User";
import Location from "../../../../assets/icons/Location";
import CircleIcon from "../../../../components/CircleIcon";
import Spacer from "../../../../components/Spacer";
import { Link } from "react-router-dom";
import { eventTimeString, generateGoogleMapsLink } from "./eventHelpers";
import { Colors } from "../../../../enums/Colors";
import { ShimmerText } from "react-shimmer-effects";
import { Flex } from "../../../../components/Listing";
import { Anchor, Body } from "../../../auth/AuthPage";


export function EventDetails({ event, merchant, artists = [] }) {
  if (event && merchant && artists) {
    return <div>
      <Flex columnGap={8}>
        <CircleIcon Icon={Clock} length={20} backgroundColor={Colors.CLEAR} />
        <Body>{eventTimeString(event)}</Body>
      </Flex>
      <Spacer y={1} />
      <Flex columnGap={8}>
        <CircleIcon
          Icon={Location}
          length={20}
          backgroundColor={Colors.CLEAR} />
        <Body>
          {`${event.address} · `}
          <Anchor 
            href={generateGoogleMapsLink(event)}
            test-id="event-details-directions-link"
          >Get directions</Anchor>
        </Body>
      </Flex>
      {merchant && (
        <div>
          <Spacer y={1} />
          <div style={{ columnGap: 8, display: "flex" }}>
            <CircleIcon
              Icon={User}
              length={20}
              backgroundColor={Colors.CLEAR} />

            <Body>
              {artists?.length > 0 && (
                <span>
                  {"Artists: "}
                  {artists.map((artist, index) => {
                    return (
                      <span key={artist.id}>
                        {index > 0 ? ", " : ""}
                        <Link
                          to={`/events/artists/${artist.id}`}
                          target="_blank"
                          rel="noreferrer"
                          test-name="event-details-artist-link"
                        >
                          {artist.name}
                        </Link>
                      </span>
                    );
                  })}
                  {". "}
                </span>
              )}
              Organised by{" "}
              <Link to="../.." test-id="event-details-organiser-link">
                {merchant.displayName}
              </Link>
            </Body>
          </div>
        </div>
      )}
    </div>;
  } else {
    return <ShimmerText line={3} />;
  }
}
