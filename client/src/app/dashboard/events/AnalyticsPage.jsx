import Spacer from "../../../components/Spacer";
import MainButton from "../../../components/MainButton";
import { Colors } from "../../../components/CircleButton";
import { useEffect, useState } from "react";
import SegmentedControl from "../../../components/SegmentedControl";
import { NetworkManager } from "../../../utils/NetworkManager";
import { useParams } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import LoadingPage from "../../../components/LoadingPage";
import Popup from 'reactjs-popup';
import Forward from "../../../assets/icons/Forward";
import Cross from "../../../assets/icons/Cross";
import CheckBox from "../../../components/CheckBox";

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

function GroupingControl({ value, onChange, groupingsListData }) {
  const labelStyle = {
    height: "100%",
    backgroundColor: Colors.OFF_WHITE,
    padding: "0 8px",
    cursor: "pointer"
  }

  return <div style={{
    height: 48,
    backgroundColor: Colors.OFF_WHITE_LIGHT,
    boxSizing: "border-box",
    alignItems: "center",
    padding: "8px 0px 8px 8px",
    display: "flex",
    columnGap: 8
  }}>
    Group by
    <Popup
      trigger={
        <button className="text-caption" style={labelStyle}>
          {value ?? "Select property"}
        </button>
      }
      {...popupProps}
    >
      {
        close => {
          return groupingsListData.map(groupingsListDatum => {
            const { name, isSelected } = groupingsListDatum
            return <MenuItem key={name} title={name} onClick={isSelected ? null : () => {
              onChange(name)
              close()
            }} />
          })
        }
      }
      
      
    </Popup>

    <div className="flex-spacer"></div>

    <div
      style={{
        width: 48,
        height: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer"
      }}
      onClick={() => onChange(null)}
    >
      <Cross length={16} color={Colors.GRAY} />
    </div>


  </div>
}

function FilterControl({ filterDatum, onChange, filtersListData }) {
  const labelStyle = {
    height: "100%", 
    backgroundColor: Colors.OFF_WHITE,
    padding: "0 8px",
    cursor: "pointer"
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

  const handleClickFilterValue = valueDatum => {
    const { isSelected } = valueDatum
    const currValues = filterDatum.values
    const newValues = isSelected ? currValues.filter(v => v.id !== valueDatum.id) : [...currValues, valueDatum]
    onChange({ property: filterDatum.property, values: newValues })
  }

  return <div style={{ 
    height: 48, 
    backgroundColor: Colors.OFF_WHITE_LIGHT, 
    boxSizing: "border-box", 
    alignItems: "center",
    padding: "8px 0px 8px 8px",
    display: "flex",
    columnGap: 8
  }}>
    
    <Popup
      trigger={
        <button className="text-caption" style={labelStyle}>
          {property ?? "Select property"}
        </button>
      }
      {...popupProps}
    >
      {
        close => {
          return filtersListData.map(filtersListDatum => {
            const { name, isSelected } = filtersListDatum
            return <MenuItem key={name} title={name} onClick={isSelected ? null : () => handleClickFilter(filtersListDatum, close)} />
          })
        }
      }
    </Popup>
    
    { shouldShowValue && "=" }
    {
      shouldShowValue && <Popup
        trigger={
          <button className="text-caption" style={{ ...labelStyle, flexShrink: 100 }}>
            {values.length > 0 ? values.map(v => v.title).join(", ") : "Select value(s)"}
          </button>
        }
        {...popupProps}
      >
        {
          close => {
            return filtersListData.find(filtersListDatum => filtersListDatum.name === filterDatum.property).values.map(valueDatum => {
              return <div key={valueDatum.id} style={{
                display: "flex",
                padding: "0 16px",
                columnGap: 16,
                cursor: "pointer",
                alignItems: "center",
                height: 48,
                borderBottom: `1px solid ${Colors.OFF_WHITE}`,
              }}>
                <CheckBox length={24} style={{ flexShrink: 100 }} color={Colors.BLACK} value={valueDatum.isSelected} onChange={() => handleClickFilterValue(valueDatum)} />
                <p>{valueDatum.title}</p>
              </div>
            })
          }
        }
      </Popup>
    }
    
    
    <div className="flex-spacer"></div>

    <div 
      style={{ 
        width: 48, 
        height: 48, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        cursor: "pointer"
      }} 
      onClick={() => onChange(null)}
    >
      <Cross length={16} color={Colors.GRAY} />
    </div>
  </div>
}

function MenuCloseItem({ title, handleClose }) {
  return <div style={{
    height: 48,
    display: "flex",
    padding: "0 16px",
    cursor: "pointer",
    alignItems: "center",
    boxSizing: "border-box",
    borderBottom: `1px solid ${Colors.OFF_WHITE}`,
  }}>
    {title}
    <div className="flex-spacer"></div>
    <div onClick={handleClose} style={{
      height: "100%",
      width: 48,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <Forward length={16} color={Colors.GRAY} />
    </div>
  </div>
}

export function MenuItem({ title, onClick, style, showsSeparator = true, showsArrow = false, isSelected = false, ...props }) {
  const [isHovering, setIsHovering] = useState(false)
  return <div 
    onClick={onClick} 
    onMouseEnter={() => setIsHovering(true)}
    onMouseLeave={() => setIsHovering(false)}
    style={{
      height: 48,
      display: "flex",
      padding: 16,
      cursor: onClick ? "pointer" : "mouse",
      color: onClick ? Colors.BLACK : Colors.GRAY_LIGHT,
      backgroundColor: (isHovering || isSelected) ? Colors.OFF_WHITE_LIGHT : Colors.CLEAR,
      alignItems: "center",
      boxSizing: "border-box",
      borderBottom: showsSeparator ? `1px solid ${Colors.OFF_WHITE}` : 0,
      fontWeight: isSelected ? 500 : 400,
      ...style
    }}
  >
    {title}
    <div className="flex-spacer"></div>
    {
      showsArrow && <div style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <Forward length={16} color={Colors.GRAY} />
      </div>
    }
    
    
  </div>
}

export default function AnalyticsPage() {
  const { merchantId } = useParams()

  const [analyticsValue, setAnalyticsValue] = useState(AnalyticsValue.REVENUE)
  const [filterData, setFilterData] = useState([])
  const [groupingData, setGroupingData] = useState([])
  const [salesData, setSalesData] = useState(null)

  useEffect(() => {
    NetworkManager.get(`/merchants/m/${merchantId}/tickets/sales-data`).then(res => {
      console.log(res.data)
      setSalesData(res.data)
    })

  }, [merchantId])

  const onAnalyticsValueChange = (event) => {
    setAnalyticsValue(event.target.value)
  }

  if (salesData) {
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

    const handleGroupingChange = (value, index) => {
      let newGroupings = groupingData
      if (value) {
        newGroupings[index] = value
      } else {
        newGroupings.splice(index, 1)
      }
      
      setGroupingData([...newGroupings])
    }

    const handleAddGrouping = () => {
      let newGroupings = groupingData
      newGroupings.push(null)
      setGroupingData([...newGroupings])
    }

    const groupingsListData = ["Event", "Product"].map(name => {
      return {
        name,
        isSelected: groupingData.some(value => value === name)
      }
    })

    const filtersListData = [
      {
        name: "Event",
        values: salesData.events
      },
      {
        name: "Product",
        values: salesData.products
      }
    ].map(datum => {
      let newDatum = datum
      const { name, values } = datum
      const filterDatum = filterData.find(d => d.property === name)
      const isFilterSelected = !!filterDatum
      newDatum["isSelected"] = isFilterSelected
      newDatum["values"] = values.map(entity => {
        const { id, title } = entity
        return {
          id,
          title, 
          isSelected: isFilterSelected && filterDatum.values.map(v => v.id).includes(id)
        }
      })
      return newDatum
    })

    const data = salesData.products
      .filter(product => {
        const productFilter = filterData
          .find(d => d.property === "Product")

        const eventFilter = filterData
          .find(d => d.property === "Event")

        function shouldIgnoreFilter(filter) {
          return !filter || filter.values.length === 0
        }

        return (
          (
            shouldIgnoreFilter(productFilter) || 
            productFilter.values
              .map(v => v.id)
              .includes(product.id)
          ) && (
            shouldIgnoreFilter(eventFilter) ||
            eventFilter.values
              .map(v => v.id)
              .includes(product.eventId)
          )
        )
      }).map(product => {
      return {
        name: product.title,
        [AnalyticsValue.REVENUE]: product.soldCount * product.price / 100,
        [AnalyticsValue.SALES_NUMBERS]: product.soldCount
      }
    })

    return <div>
      <Spacer y={5} />
      <h1 className="header-l">Analytics</h1>
      <Spacer y={3} />
      <div style={{ display: "flex", columnGap: 48 }}>
        <div style={{ width: 320 }}>
          <h3 className="header-s">Value</h3>
          <Spacer y={2} />
          <SegmentedControl values={[AnalyticsValue.REVENUE, AnalyticsValue.SALES_NUMBERS]} value={analyticsValue} onChange={onAnalyticsValueChange} />
          <Spacer y={4} />
          <h3 className="header-s">Filters</h3>
          <Spacer y={2} />
          {
            filterData.length > 0 ?
              filterData.map((filterDatum, index) => {
                return <div key={index}>
                  <FilterControl 
                    filterDatum={filterDatum} 
                    onChange={(filterDatum) => handleFilterChange(filterDatum, index)}
                    filtersListData={filtersListData}
                  />
                  <Spacer y={2} />
                </div>
              }) :
              <div>
                <p>No filters yet</p>
                <Spacer y={2} />
              </div>
          }
          <MainButton title="Add filter" onClick={handleAddFilter} />
          
          <Spacer y={4} />
          <h3 className="header-s">Groupings</h3>
          <Spacer y={2} />
          {
            groupingData.length > 0 ?
              groupingData.map((grouping, index) => {
                return <div>
                  <GroupingControl 
                    value={grouping}
                    onChange={(value) => handleGroupingChange(value, index)}
                    groupingsListData={groupingsListData}
                  />
                  <Spacer y={2} />
                </div>
              }) :
              <div>
                <p>No groupings yet</p>
                <Spacer y={2} />
              </div>

          }
          <MainButton title="Add grouping" onClick={handleAddGrouping} />
        </div>

        <div className="flex-spacer" style={{ height: "60vh" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart width={150} height={40} data={data}>
              <YAxis />
              <XAxis dataKey="name" />
              <Tooltip />
              <Bar dataKey={analyticsValue} fill={Colors.BLACK} />
            </BarChart>
          </ResponsiveContainer>


        </div>
      </div>
    </div>
  } else {
    return <LoadingPage />
  }
}