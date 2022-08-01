import Spacer from "../../../../components/Spacer"
import MainButton from "../../../../components/MainButton"
import { Colors } from "../../../../enums/Colors"
import { useEffect, useState } from "react"
import SegmentedControl from "../../../../components/SegmentedControl"
import { NetworkManager } from "../../../../utils/NetworkManager"
import { useParams } from "react-router-dom"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import LoadingPage from "../../../../components/LoadingPage"
import Popup from "reactjs-popup"
import Forward from "../../../../assets/icons/Forward"
import Cross from "../../../../assets/icons/Cross"
import CheckBox from "../../../../components/CheckBox"
import IconPage from "../../../../components/IconPage"
import Discover from "../../../../assets/icons/Discover"
import Dropdown from "../../../../components/input/Dropdown"
import { dateFromTimestamp } from "../../../../utils/helpers/time"
import { format, startOfWeek } from "date-fns"
import { getCurrencySymbol } from "../../../../utils/helpers/money"
import { isMobile } from "react-device-detect"

class AnalyticsValue {
  static SALES_NUMBERS = "Sales numbers"
  static REVENUE = "Revenue"
}

const popupProps = {
  on: "click",
  position: "right top",
  arrow: false,
  closeOnDocumentClick: true,
  contentStyle: {
    padding: 0,
    width: 320,
    backgroundColor: Colors.WHITE,
    border: `1px solid ${Colors.OFF_WHITE}`,
    borderBottom: 0,
  },
}

function FilterControl({ filterDatum, onChange, filtersListData }) {
  const labelStyle = {
    height: "100%",
    backgroundColor: Colors.OFF_WHITE,
    padding: "0 8px",
    cursor: "pointer",
  }

  const { property, values } = filterDatum

  const shouldShowValue = !!filterDatum.property

  const handleClickFilter = (filtersListDatum, close) => {
    const { name } = filtersListDatum

    if (name !== filterDatum.name) {
      onChange({ property: name, values: [] })
    }

    close()
  }

  const handleClickFilterValue = (valueDatum) => {
    const { isSelected } = valueDatum
    const currValues = filterDatum.values
    const newValues = isSelected
      ? currValues.filter((v) => v.id !== valueDatum.id)
      : [...currValues, valueDatum]
    onChange({ property: filterDatum.property, values: newValues })
  }

  return (
    <div
      style={{
        height: 48,
        backgroundColor: Colors.OFF_WHITE_LIGHT,
        boxSizing: "border-box",
        alignItems: "center",
        padding: "8px 0px 8px 8px",
        display: "flex",
        columnGap: 8,
      }}
    >
      <Popup
        trigger={
          <button className="text-caption" style={labelStyle}>
            {property ?? "Select property"}
          </button>
        }
        {...popupProps}
      >
        {(close) => {
          return filtersListData.map((filtersListDatum) => {
            const { name, isSelected } = filtersListDatum
            return (
              <MenuItem
                key={name}
                title={name}
                onClick={
                  isSelected
                    ? null
                    : () => handleClickFilter(filtersListDatum, close)
                }
              />
            )
          })
        }}
      </Popup>

      {shouldShowValue && "="}
      {shouldShowValue && (
        <Popup
          trigger={
            <button
              className="text-caption"
              style={{ ...labelStyle, flexShrink: 100 }}
            >
              {values.length > 0
                ? values.map((v) => v.title).join(", ")
                : "Select value(s)"}
            </button>
          }
          {...popupProps}
        >
          {(close) => {
            return filtersListData
              .find(
                (filtersListDatum) =>
                  filtersListDatum.name === filterDatum.property
              )
              .values.map((valueDatum) => {
                return (
                  <div
                    key={valueDatum.id}
                    style={{
                      display: "flex",
                      padding: "0 16px",
                      columnGap: 16,
                      cursor: "pointer",
                      alignItems: "center",
                      height: 48,
                      borderBottom: `1px solid ${Colors.OFF_WHITE}`,
                    }}
                  >
                    <CheckBox
                      style={{ flexShrink: 100 }}
                      color={Colors.BLACK}
                      value={valueDatum.isSelected}
                      onChange={(event) => handleClickFilterValue(valueDatum)}
                    />
                    <p>{valueDatum.title}</p>
                  </div>
                )
              })
          }}
        </Popup>
      )}

      <div className="flex-spacer"></div>

      <div
        style={{
          width: 48,
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
        onClick={() => onChange(null)}
      >
        <Cross length={16} color={Colors.GRAY} />
      </div>
    </div>
  )
}

export function MenuItem({
  title,
  onClick,
  style,
  showsSeparator = true,
  showsArrow = false,
  isSelected = false,
  ...props
}) {
  const [isHovering, setIsHovering] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{
        height: 48,
        display: "flex",
        padding: 16,
        cursor: onClick ? "pointer" : "mouse",
        color: onClick ? Colors.BLACK : Colors.GRAY_LIGHT,
        backgroundColor:
          isHovering || isSelected ? Colors.OFF_WHITE_LIGHT : Colors.CLEAR,
        alignItems: "center",
        boxSizing: "border-box",
        borderBottom: showsSeparator ? `1px solid ${Colors.OFF_WHITE}` : 0,
        fontWeight: isSelected ? 500 : 400,
        ...style,
      }}
    >
      {title}
      <div className="flex-spacer"></div>
      {showsArrow && (
        <div
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Forward length={16} color={Colors.GRAY} />
        </div>
      )}
    </div>
  )
}

export default function AnalyticsPage({ merchant }) {
  const { merchantId } = useParams()

  const [analyticsValue, setAnalyticsValue] = useState(AnalyticsValue.REVENUE)
  const [filterData, setFilterData] = useState([])
  const [grouping, setGrouping] = useState("Product")
  const [salesData, setSalesData] = useState(null)

  useEffect(() => {
    NetworkManager.get(`/merchants/m/${merchantId}/tickets/sales-data`).then(
      (res) => {
        console.log(res.data)
        setSalesData(res.data)
      }
    )
  }, [merchantId])

  const onAnalyticsValueChange = (event) => {
    setAnalyticsValue(event.target.value)
  }

  if (salesData) {
    if (salesData.sales.length === 0) {
      return (
        <IconPage
          Icon={Discover}
          iconBackgroundColor={Colors.OFF_WHITE_LIGHT}
          iconForegroundColor={Colors.BLACK}
          name="analytics-no-sales"
          title="No sales data yet"
          body="Once you start selling tickets, you'll be able to view the data here."
        />
      )
    }

    const handleFilterChange = (filterDatum, index) => {
      let newData = filterData

      if (filterDatum) {
        newData[index] = filterDatum
      } else {
        newData.splice(index, 1)
      }

      setFilterData([...newData])
    }

    const handleAddFilter = () => {
      const emptyFilterDatum = { property: null, values: [] }
      let newData = filterData
      newData.push(emptyFilterDatum)
      setFilterData([...newData])
    }

    const filtersListData = [
      {
        name: "Event",
        values: salesData.events,
      },
      {
        name: "Product",
        values: salesData.products,
      },
      {
        name: "Source",
        values: [
          ...new Set(
            salesData.sales.map(
              (datum) => datum.attributionData?.source ?? "None"
            )
          ),
        ].map((value) => ({ id: value, title: value })),
      },
      {
        name: "Campaign",
        values: [
          ...new Set(
            salesData.sales.map(
              (datum) => datum.attributionData?.campaign ?? "None"
            )
          ),
        ].map((value) => ({ id: value, title: value })),
      },
    ].map((datum) => {
      let newDatum = datum
      const { name, values } = datum
      const filterDatum = filterData.find((d) => d.property === name)
      const isFilterSelected = !!filterDatum
      newDatum["isSelected"] = isFilterSelected
      newDatum["values"] = values.map((entity) => {
        const { id, title } = entity
        return {
          id,
          title,
          isSelected:
            isFilterSelected &&
            filterDatum.values.map((v) => v.id).includes(id),
        }
      })

      return newDatum
    })

    const filteredSalesData = salesData.sales.filter((datum) => {
      const filterMap = {
        Product: datum.productId,
        Event: datum.eventId,
        Source: datum.attributionData?.source ?? "None",
        Campaign: datum.attributionData?.campaign ?? "None",
      }

      return Object.entries(filterMap).every(([filterName, filterValue]) => {
        const filter = filterData.find((d) => d.property === filterName)
        const shouldIgnoreFilter = !filter || filter.values.length === 0

        return (
          shouldIgnoreFilter ||
          filter.values.map((v) => v.id).includes(filterValue)
        )
      })
    })

    // Then group it by the right value into an array, totaling the groups sales or quantity

    // First need to get an array of the groups, then map through each group and construct the array element

    function getGroupingValuesFromDatum(datum, grouping) {
      function defaultValue(attributeName) {
        const value = datum[attributeName] ?? "Not determined"
        return { value, label: value, sortValue: value }
      }

      switch (grouping) {
        case "Product":
          return {
            value: datum.productId,
            label: datum.productTitle,
            sortValue: datum.productTitle,
          }
        case "Event":
          return {
            value: datum.eventId,
            label: datum.eventTitle,
            sortValue: datum.eventTitle,
          }
        case "Time":
          const orderDate = dateFromTimestamp(datum.createdAt)
          const intervalDate = startOfWeek(orderDate, {
            weekStartsOn: 1,
          })
          const dateString = format(intervalDate, "do MMM")
          return {
            value: intervalDate.toString(),
            label: dateString,
            sortValue: intervalDate,
          }
        case "Returning user":
          const val = datum.isExistingUser ? "Returning user" : "New user"
          return { value: val, label: val, sortValue: val }
        case "Location":
          return defaultValue("locationName")
        case "Gender":
          return defaultValue("gender")
        case "Device type":
          return defaultValue("deviceType")
        case "Browser":
          return defaultValue("browser")
        case "Platform":
          return defaultValue("platform")
        case "Operating system":
          return defaultValue("os")
        default:
          const value = datum.attributionData
            ? datum.attributionData[grouping.toLowerCase()]
            : "None"
          return { value, label: value, sortValue: value }
      }
    }

    const duplicatedGroupingValueStrings = filteredSalesData.map((datum) => {
      const groupingValues = getGroupingValuesFromDatum(datum, grouping)
      const groupingValuesString = JSON.stringify(groupingValues)
      return groupingValuesString
    })

    const groupingValueStrings = [...new Set(duplicatedGroupingValueStrings)]

    const groupingValues = groupingValueStrings.map((str) => JSON.parse(str))

    const groupedSalesData = groupingValues.map(({ value, label }) => {
      const groupSalesData = filteredSalesData.filter(
        (datum) => getGroupingValuesFromDatum(datum, grouping).value === value
      )

      const { amount, quantity } = groupSalesData.reduce(
        (aggregateData, datum) => {
          aggregateData.amount += datum.amount
          aggregateData.quantity += datum.quantity

          return aggregateData
        },
        { amount: 0, quantity: 0 }
      )

      return {
        name: label,
        [AnalyticsValue.REVENUE]: amount,
        [AnalyticsValue.SALES_NUMBERS]: quantity,
      }
    })

    const formatter = (num) =>
      analyticsValue === AnalyticsValue.REVENUE
        ? `${getCurrencySymbol(merchant?.currency ?? "GBP")}${num / 100}`
        : num.toString()

    const filtersSection = <div style={{ width: isMobile ? "100%" : 320 }}>
      <h3 className="header-s">Value</h3>
      <Spacer y={2} />
      <SegmentedControl
        values={[AnalyticsValue.REVENUE, AnalyticsValue.SALES_NUMBERS]}
        value={analyticsValue}
        onChange={onAnalyticsValueChange}
      />
      <Spacer y={4} />
      <h3 className="header-s">Filters</h3>
      <Spacer y={2} />
      {filterData.length > 0 ? (
        filterData.map((filterDatum, index) => {
          return (
            <div key={index}>
              <FilterControl
                filterDatum={filterDatum}
                onChange={(filterDatum) =>
                  handleFilterChange(filterDatum, index)
                }
                filtersListData={filtersListData}
              />
              <Spacer y={2} />
            </div>
          )
        })
      ) : (
        <div>
          <p>No filters yet</p>
          <Spacer y={2} />
        </div>
      )}
      <MainButton title="Add filter" onClick={handleAddFilter} />

      <Spacer y={4} />
      <h3 className="header-s">View by</h3>
      <Spacer y={2} />
      <Dropdown
        value={grouping}
        onChange={(event) => setGrouping(event.target.value)}
        optionList={[
          { value: "Event" },
          { value: "Product" },
          { value: "Time" },
          { value: "Source" },
          { value: "Campaign" },
          { value: "Returning user" },
          { value: "Gender" },
          { value: "Location" },
          { value: "Browser" },
          { value: "Device type" },
          { value: "Platform" },
          { value: "Operating system" },
        ]}
      />
      <Spacer y={2} />
    </div>

    const graphSection = <div className="flex-spacer" style={{ height: "60vh" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart width={150} height={40} data={groupedSalesData}>
          <YAxis tickFormatter={formatter} />

          <XAxis dataKey="name" />
          <Tooltip formatter={formatter} />
          <Bar dataKey={analyticsValue} fill={Colors.BLACK} />
        </BarChart>
      </ResponsiveContainer>
    </div>

    return (
      <div>
        <Spacer y={5} />
        <h1 className="header-l">Analytics</h1>
        <Spacer y={3} />
        {
          isMobile ?
            <div>
              {filtersSection}
              <Spacer y={3} />
              {graphSection}
            </div> :
            <div style={{ display: "flex", columnGap: 48 }}>
              {filtersSection}
              {graphSection}
            </div>
        }
      </div>
    )
  } else {
    return <LoadingPage />
  }
}
