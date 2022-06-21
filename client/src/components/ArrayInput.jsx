import SmallButton from "./SmallButton"
import React from "react";
import IconButton from "./IconButton";
import { ButtonTheme } from "./ButtonTheme";
import Cross from "../assets/icons/Cross";
import Spacer from "./Spacer";

export default function ArrayInput({ input, maxItemCount = 100, name, value = [], onChange }) {
  const canAddAnotherItem = value.length < maxItemCount

  const handleAddInput = () => {
    let newValue = value
    newValue.push(null)
    onChange({ target: { name, value: newValue } })
  }

  const handleItemChange = (event, index) => {
    let newValue = value
    newValue[index] = event.target.value
    onChange({ target: { name, value: newValue } })
  }

  const handleRemoveInput = (index) => {
    let newValue = value
    newValue.splice(index, 1)

    onChange({ target: { name, value: newValue }})
  }

  return <div>
    <input disabled={true} style={{ display: "none" }}/>
    <Spacer y={1} />
    {
      value.length > 0 ?
        value.map((item, index) => {
          const Input = React.cloneElement(input, { value: item, onChange: (event) => handleItemChange(event, index) })
          return <div key={index}>
            <div style={{ display: "flex", alignItems: "center", columnGap: 16 }}>
              {Input}
              <IconButton Icon={Cross} length={24} buttonTheme={ButtonTheme.CLEAN} onClick={() => handleRemoveInput(index)} />
            </div>
            <Spacer y={2} />
          </div>
          
        }) :
        <div>
          <p className="text-body-faded">No values yet</p>
          <Spacer y={2} />
        </div>
        
    }
    <SmallButton title="Add" onClick={handleAddInput} disabled={!canAddAnotherItem} />
  </div>
}