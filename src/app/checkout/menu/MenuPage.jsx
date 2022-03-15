import { Link, useParams } from "react-router-dom";
import AsyncImage from "../../../components/AsyncImage";
import MenuItem from "./MenuItem";
import "./MenuPage.css";
import Spacer from "../../../components/Spacer";
import { formatMinutes } from "../../../utils/helpers/time";
import NavBar from "../../../components/NavBar";
import { Helmet } from "react-helmet-async";
import useBasket from "../basket/useBasket";
import LoadingPage from "../../../components/LoadingPage";
import MainButton from "../../../components/MainButton";
import { getMerchantStorageRef } from "../../../utils/helpers/storage";
import { useEffect } from "react";
import { PageName, viewPage } from "../../../utils/AnalyticsManager";

export default function MenuPage({
  merchant,
  menuItems = [],
  menuSections = [],
  openHourRanges = [],
  orders = [],
}) {
  const { itemCount } = useBasket();
  const { merchantId } = useParams();

  useEffect(() => {
    viewPage(PageName.MENU, { merchantId });
  }, [merchantId]);

  const groupedMenuItems = {};

  menuItems.forEach((menuItem) => {
    const menuSectionId = menuItem.section_id;
    const currValue = groupedMenuItems[menuSectionId];

    if (currValue) {
      groupedMenuItems[menuSectionId].push(menuItem);
    } else {
      groupedMenuItems[menuSectionId] = [menuItem];
    }
  });

  function generateOpenHourText() {
    const now = new Date();
    let dayOfWeek = now.getDay();

    // The above defines day of week as 0 - 6 Sun - Sat
    // We want 1 - 7 Mon - Sun
    if (dayOfWeek === 0) {
      dayOfWeek = 7;
    }

    const minutes = now.getHours() * 60 + now.getMinutes();

    const todayRanges = openHourRanges
      .filter((range) => range.day_of_week === dayOfWeek)
      .sort((range1, range2) => range1.close_time - range2.close_time);

    const openRanges = todayRanges.filter(
      (range) => range.close_time > minutes
    );

    if (openRanges.length === 0) {
      if (todayRanges.length === 0) {
        return "Closed today";
      } else {
        const mins = todayRanges[todayRanges.length - 1].close_time;
        return `Closed at ${formatMinutes(mins)}`;
      }
    } else {
      const mins = openRanges[openRanges.length - 1].close_time;
      return `Open until ${formatMinutes(mins)}`;
    }
  }

  const isLoading =
    !merchant ||
    menuSections.length === 0 ||
    menuItems.length === 0 ||
    openHourRanges.length === 0;

  return isLoading ? (
    <LoadingPage message="Loading" />
  ) : (
    <div className="container">
      <Helmet>
        <title>{merchant.display_name}</title>
      </Helmet>

      <NavBar
        title={merchant.display_name}
        transparentDepth={50}
        opaqueDepth={100}
        showsBackButton={false}
      />

      <AsyncImage
        imageRef={getMerchantStorageRef(merchant.id, merchant.photo)}
        className="headerImage"
        alt={merchant.display_name}
      />
      <Spacer y={3} />
      <div className="content">
        <h1 className="header-l">{merchant.display_name}</h1>
        <Spacer y={1} />
        <Link to="about" state={{ merchant, openHourRanges }}>
          <p className="text-body">{merchant.tags.join(" · ")}</p>
          <Spacer y={1} />
          <p className="text-body-faded">{generateOpenHourText()}</p>
        </Link>
        <Spacer y={3} />
        {menuSections.map((section) => (
          <div key={section.id}>
            <h2 className="header-m">{section.name}</h2>
            <Spacer y={2} />
            {groupedMenuItems[section.id] &&
              groupedMenuItems[section.id].map((menuItem) => (
                <div key={menuItem.id}>
                  <MenuItem item={menuItem} />
                  <Spacer y={3} />
                </div>
              ))}
          </div>
        ))}
        <Spacer y={8} />
      </div>

      {(itemCount > 0 || orders.length > 0) && (
        <div className="anchored-bottom">
          <div style={{ margin: "16px" }}>
            {itemCount > 0 && orders.length === 0 && (
              <Link to="basket">
                <MainButton
                  title="View basket"
                  style={{ boxSizing: "borderBox" }}
                  sideMessage={`${itemCount} item${itemCount === 1 ? "" : "s"}`}
                />
              </Link>
            )}
            {orders.length > 0 && (
              <Link to={`checkout/${orders[0].id}/payment-success`}>
                <MainButton
                  title={`View order`}
                  style={{ boxSizing: "borderBox" }}
                />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
