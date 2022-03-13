import BottomNavBar from "../../../../components/BottomNavBar";
import { getWeekdays, formatMinutes } from "../../../../utils/helpers/time";
import { Helmet } from "react-helmet-async";
import AsyncImage from "../../../../components/AsyncImage";
import { getMerchantStorageRef } from "../../../../utils/helpers/storage";
import Spacer from "../../../../components/Spacer";
import CircleIcon from "../../../../components/CircleIcon";
import Clock from "../../../../assets/icons/Clock";
import Location from "../../../../assets/icons/Location";
import Details from "../../../../assets/icons/Details";
import TextLine from "../../../../components/TextLine";
import MainButton from "../../../../components/MainButton";
import "./MerchantAccountPage.css";
import { Colors } from "../../../../components/CircleButton";

function MerchantAccountPage(props) {
  const { merchantData, openingHours } = props;
  const weekdays = getWeekdays("en-GB");
  const openingHourGridItems = [];
  const formattedSortCode =
    merchantData.sort_code.slice(0, 2) +
    "-" +
    merchantData.sort_code.slice(2, 4) +
    "-" +
    merchantData.sort_code.slice(4, 6);

  openingHours
    .sort((range1, range2) => range1.day_of_week - range2.day_of_week)
    .forEach((range, index) => {
      const weekday = weekdays[range.day_of_week - 1];

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
          {`${formatMinutes(range.open_time)} - ${formatMinutes(
            range.close_time
          )}`}
        </div>
      );
    });

  console.log("Merchant Account Page");
  console.log("Merchant Account Page merchantData:", merchantData);
  console.log("Merchant Account Page Opening Hours:", openingHours);

  return (
    <div className="container">
      <Helmet>
        <title>{merchantData.display_name}</title>
      </Helmet>
      <AsyncImage
        imageRef={getMerchantStorageRef(merchantData.id, merchantData.photo)}
        className="headerImage"
        alt={merchantData.display_name}
      />
      <div className="content">
        <h1 className="header-l">{merchantData.display_name}</h1>
        <p className="text-body">{merchantData.tags.join(" · ")}</p>

        <Spacer y={2} />

        <div style={{ display: "flex", alignItems: "center" }}>
          <CircleIcon Icon={Details} style={{ marginRight: 8 }} />
          <div className="header-s">Details</div>
        </div>
        <Spacer y={2} />
        <TextLine
          leftComponent="Display Name"
          rightComponent={merchantData.display_name}
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
          rightComponent={merchantData.account_number}
        />
        <TextLine
          leftComponent="Business Name"
          rightComponent={merchantData.company_name}
        />

        <Spacer y={1} />

        <div style={{ display: "flex", alignItems: "center" }}>
          <CircleIcon Icon={Location} style={{ marginRight: 8 }} />
          <div className="header-s">Address</div>
        </div>
        <Spacer y={2} />
        <p className="text-body-faded">{merchantData.address}</p>
        <Spacer y={3} />

        <div style={{ display: "flex", alignItems: "center" }}>
          <CircleIcon Icon={Clock} style={{ marginRight: 8 }} />
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
        <Spacer y={3} />
        <BottomNavBar />
      </div>
    </div>
  );
}

export default MerchantAccountPage;
