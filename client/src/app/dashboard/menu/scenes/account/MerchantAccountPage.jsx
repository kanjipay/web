import BottomNavBar from "../../../../../components/BottomNavBar";
import { getWeekdays, formatMinutes } from "../../../../../utils/helpers/time";
import { Helmet } from "react-helmet-async";
import AsyncImage from "../../../../../components/AsyncImage";
import { getMerchantStorageRef } from "../../../../../utils/helpers/storage";
import Spacer from "../../../../../components/Spacer";
import CircleIcon from "../../../../../components/CircleIcon";
import Clock from "../../../../../assets/icons/Clock";
import Location from "../../../../../assets/icons/Location";
import Details from "../../../../../assets/icons/Details";
import TextLine from "../../../../../components/TextLine";
import MainButton from "../../../../../components/MainButton";
import "./MerchantAccountPage.css";
import { Colors } from "../../../../../components/CircleButton";

function MerchantAccountPage(props) {
  const { merchantData, openingHours } = props;
  const weekdays = getWeekdays("en-GB");
  const openingHourGridItems = [];
  const formattedSortCode =
    merchantData.sortCode.slice(0, 2) +
    "-" +
    merchantData.sortCode.slice(2, 4) +
    "-" +
    merchantData.sortCode.slice(4, 6);

  openingHours
    .sort((range1, range2) => range1.dayOfWeek - range2.dayOfWeek)
    .forEach((range, index) => {
      const weekday = weekdays[range.dayOfWeek - 1];

      openingHourGridItems.push(
        <div
          key={`title-${index}`}
          className="header-xs MerchantAboutPage__dayItem"
        >
          {weekday}
        </div>
      );

      openingHourGridItems.push(
        <div
          key={`hours-${index}`}
          className="text-caption MerchantAboutPage__hoursItem"
        >
          {`${formatMinutes(range.openTime)} - ${formatMinutes(
            range.closeTime
          )}`}
        </div>
      );
    });

  return (
    <div className="container">
      <Helmet>
        <title>{merchantData.displayName}</title>
      </Helmet>
      <AsyncImage
        imageRef={getMerchantStorageRef(merchantData.id, merchantData.photo)}
        className="headerImage"
        alt={merchantData.displayName}
      />
      <div className="content">
        <h1 className="header-l">{merchantData.displayName}</h1>
        <p className="text-body">{merchantData.tags.join(" · ")}</p>

        <Spacer y={2} />

        <div style={{ display: "flex", alignItems: "center" }}>
          <CircleIcon Icon={Details} style={{ marginRight: 8 }} backgroundColor={Colors.CLEAR} />
          <div className="header-s">Details</div>
        </div>
        <Spacer y={2} />
        <TextLine
          leftComponent="Display Name"
          rightComponent={merchantData.displayName}
        />
        <TextLine
          leftComponent="Tags"
          rightComponent={merchantData.tags.join(" · ")}
        />
        <TextLine
          leftComponent="Sort Code"
          rightComponent={formattedSortCode}
        />
        <TextLine
          leftComponent="Account Number"
          rightComponent={merchantData.accountNumber}
        />
        <TextLine
          leftComponent="Business Name"
          rightComponent={merchantData.companyName}
        />

        <Spacer y={1} />

        <div style={{ display: "flex", alignItems: "center" }}>
          <CircleIcon Icon={Location} style={{ marginRight: 8 }} backgroundColor={Colors.CLEAR} />
          <div className="header-s">Address</div>
        </div>
        <Spacer y={2} />
        <p className="text-body-faded">{merchantData.address}</p>
        <Spacer y={3} />

        <div style={{ display: "flex", alignItems: "center" }}>
          <CircleIcon Icon={Clock} style={{ marginRight: 8 }} backgroundColor={Colors.CLEAR} />
          <div className="header-s">Opening hours</div>
        </div>
        <Spacer y={2} />

        <div className="MerchantAboutPage__openingTimeGrid">
          {openingHourGridItems}
        </div>
        <Spacer y={10} />
      </div>

      <div
        className="anchored-bottom"
        style={{ backgroundColor: Colors.WHITE }}
      >
        <div style={{ margin: "16px" }}>
          <MainButton
            title={`Request Account Details Change`}
            style={{ boxSizing: "borderBox" }}
          />
        </div>

        <BottomNavBar />
      </div>
    </div>
  );
}

export default MerchantAccountPage;
