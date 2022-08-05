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
import IconPage from "../../../../components/IconPage"
import Discover from "../../../../assets/icons/Discover"
import Dropdown from "../../../../components/input/Dropdown"
import { formatCurrency } from "../../../../utils/helpers/money"
import { isMobile } from "react-device-detect"
import { FilterControl } from "./FilterControl"
import { dateFromTimestamp } from "../../../../utils/helpers/time"
import { format, startOfDay, startOfMonth, startOfWeek } from "date-fns"

class AnalyticsValue {
  static SALES_NUMBERS = "Sales numbers"
  static REVENUE = "Revenue"
}

const getStartDay = datum => startOfDay(dateFromTimestamp(datum.createdAt)).getTime()
const getStartWeek = datum => startOfWeek(dateFromTimestamp(datum.createdAt), { weekStartsOn: 1 }).getTime()
const getStartMonth = datum => startOfMonth(dateFromTimestamp(datum.createdAt)).getTime()

class AnalyticsProperty {
  constructor(
    name,
    id,
    title,
    sort
  ) {
    this.name = name
    this.idGetter = typeof id === "string" ? datum => datum[id] : id
    this.titleGetter = title ? (typeof title === "string" ? datum => datum[title] : title) : this.idGetter
    this.sortValueGetter = typeof sort === "string" ? datum => datum[sort] : sort
  }

  static EVENT = new AnalyticsProperty("Event", "eventId", "eventTitle")
  static PRODUCT = new AnalyticsProperty("Ticket type", "productId", "productTitle")
  static DAY = new AnalyticsProperty(
    "Day", 
    getStartDay, 
    datum => format(getStartDay(datum), "do MMM"),
    getStartDay
  )
  static WEEK = new AnalyticsProperty("Week", getStartWeek, datum => format(getStartWeek(datum), "do MMM"), getStartWeek)
  static MONTH = new AnalyticsProperty("Month", getStartMonth, datum => format(getStartMonth(datum), "MMM yy"), getStartMonth)
  static GENDER = new AnalyticsProperty("Gender", "gender")
  static DEVICE_TYPE = new AnalyticsProperty("Device type", "deviceType")
  static OS = new AnalyticsProperty("OS", "os")
  static PLATFORM = new AnalyticsProperty("Platform", "platform")
  static BROWSER = new AnalyticsProperty("Browser", "browser")
  static IS_EXISTING_USER = new AnalyticsProperty("Is existing user", "isExistingUser", datum => !!datum.isExistingUser ? "Existing" : "New")
  static SOURCE = new AnalyticsProperty("Source", datum => datum.attributionData?.source ?? "None")
  static CAMPAIGN = new AnalyticsProperty("Campaign", datum => datum.attributionData?.campaign ?? "None")
  static LOCATION = new AnalyticsProperty("Location", "locationName")

  static allProperties = [
    this.EVENT,
    this.PRODUCT,
    this.DAY,
    this.WEEK,
    this.MONTH,
    this.SOURCE,
    this.CAMPAIGN,
    this.GENDER,
    this.DEVICE_TYPE,
    this.OS,
    this.PLATFORM,
    this.BROWSER,
    this.IS_EXISTING_USER,
    this.LOCATION
  ]
}

export const popupProps = {
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

export default function AnalyticsPage({ merchant }) {
  const { merchantId } = useParams()

  const [analyticsValue, setAnalyticsValue] = useState(AnalyticsValue.REVENUE)
  const [filterData, setFilterData] = useState([])
  const [grouping, setGrouping] = useState(AnalyticsProperty.PRODUCT.name)
  const [salesData, setSalesData] = useState(null)

  useEffect(() => {
    NetworkManager.get(`/merchants/m/${merchantId}/tickets/sales-data`).then(res => setSalesData(res.data))
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

    const allValues = AnalyticsProperty.allProperties.map(property => {
      const { name, idGetter, titleGetter, sortValueGetter } = property
      const filterDatum = filterData.find((d) => d.property === name)

      const propertyDataStrings = salesData.sales.map(datum => {
        const id = idGetter(datum)
        const obj = { 
          id, 
          title: titleGetter(datum) ?? "Not determined",
          sortValue: sortValueGetter ? sortValueGetter(datum) : null,
          isSelected: filterDatum?.values.map((v) => v.id).includes(id) ?? false
        }

        return JSON.stringify(obj)
      })

      const uniquePropertyDataStrings = [...new Set(propertyDataStrings)]
      const uniquePropertyData = uniquePropertyDataStrings.map(s => JSON.parse(s, (key, value) => {
        if (key === "id" || key === "sortValue") {
          const isDate = !!Date.parse(value)
          return isDate ? new Date(value) : value
        } else {
          return value
        }
      }))

      return { name, isSelected: !!filterDatum, values: uniquePropertyData }
    })

    const filteredData = salesData.sales.filter(salesDatum => {
      return filterData.every(({ property, values }) => {
        if (!property || values.length === 0) {
          return true
        }

        const analyticsProperty = AnalyticsProperty.allProperties.find(p => p.name === property)

        if (!analyticsProperty) {
          return true
        }

        const id = analyticsProperty.idGetter(salesDatum)

        return values.map(v => v.id).includes(id)
      })
    })

    const groupingProperty = AnalyticsProperty.allProperties.find(p => p.name === grouping)

    function poundExchangeRate(currency) {
      switch (currency) {
        case "GBP":
          return 1
        case "EUR":
          return 0.84
        default:
          return 1
      }
    }

    const groupedData = allValues
      .find(v => v.name === grouping)
      .values
      .map(({ id, title, sortValue }) => {
        const groupingData = filteredData.filter(datum => {
          return id === groupingProperty.idGetter(datum)
        })

        const salesNumber = groupingData.reduce((salesNumber, datum) => salesNumber + datum.quantity, 0)
        const revenue = groupingData.reduce((revenue, datum) => revenue + datum.amount * poundExchangeRate(datum.currency) / poundExchangeRate(merchant.currency ?? "GBP"), 0)

        const analyticsValues = {
          [AnalyticsValue.SALES_NUMBERS]: salesNumber,
          [AnalyticsValue.REVENUE]: revenue
        }

        return {
          title,
          sortValue: sortValue ?? analyticsValues[analyticsValue],
          ...analyticsValues
        }
      })
      .sort((i1, i2) => {
        return i1.sortValue - i2.sortValue
      })

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

    const formatter = (num) =>
      analyticsValue === AnalyticsValue.REVENUE
        ? formatCurrency(num, merchant.currency ?? "GBP")
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
                filtersListData={allValues}
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
        optionList={AnalyticsProperty.allProperties.map(({ name }) => ({ value: name }))}
      />
      <Spacer y={2} />
    </div>

    const graphSection = <div className="flex-spacer" style={{ height: "60vh" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart width={150} height={40} data={groupedData}>
          <YAxis tickFormatter={formatter} />

          <XAxis dataKey="title" />
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
