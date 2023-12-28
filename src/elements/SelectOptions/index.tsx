import { ReactFacetedSearchOptions } from "@/types/ReactFacetedSearchOptions"
import React from "react"
import './SelectOptions.css'

export type PropertyType = 'maxDropDownHeight' | 'minStaticListHeight' | 'maxStaticListHeight' |
  'showCategories' | 'categoryPosition' | 'hideToolTip' | 'promiseDelay' | 'mockPromiseTime'
export interface SelectOptionsProps {
  options: ReactFacetedSearchOptions
  onValueChanged: (options: ReactFacetedSearchOptions) => void
}

const SelectOptions: React.FC<SelectOptionsProps> = ({
  options,
  onValueChanged,
}) => {
  return (
    <div className="optionsMain">
      <div className="optionGroup">
        <label>maxDropDownHeight</label>
        <input type='number' value={options.maxDropDownHeight} onChange={e => onValueChanged({ ...options, maxDropDownHeight: Number.parseFloat(e.target.value) })} />
      </div>
      <div className="optionGroup">
        <label>minStaticListHeight</label>
        <input type='number' value={options.minStaticListHeight} onChange={e => onValueChanged({ ...options, minStaticListHeight: Number.parseFloat(e.target.value) })} />
      </div>
      <div className="optionGroup">
        <label>maxStaticListHeight</label>
        <input type='number' value={options.maxStaticListHeight} onChange={e => onValueChanged({ ...options, maxStaticListHeight: Number.parseFloat(e.target.value) })} />
      </div>
      <div className="optionGroup">
        <label>showCategories</label>
        <input type='checkbox' checked={options.showCategories} onChange={e => onValueChanged({ ...options, showCategories: e.target.checked })} />
      </div>
      <div className="optionGroup">
        <label>categoryPosition</label>
        <div className="optionCategoryPos" onClick={() => onValueChanged({ ...options, categoryPosition: options.categoryPosition === 'top' ? 'left' : 'top' })}>{options.categoryPosition}</div>
      </div>
      <div className="optionGroup">
        <label>hideToolTip</label>
        <input type='checkbox' checked={options.hideToolTip} onChange={e => onValueChanged({ ...options, hideToolTip: e.target.checked })} />
      </div>
      <div className="optionGroup">
        <label>promiseDelay</label>
        <input type='number' value={options.promiseDelay} onChange={e => onValueChanged({ ...options, promiseDelay: Number.parseInt(e.target.value) })} />
      </div>
      <div className="optionGroup">
        <label>mockPromiseTime</label>
        <input type='number' value={options.mockPromiseTime} onChange={e => onValueChanged({ ...options, mockPromiseTime: Number.parseInt(e.target.value) })} />
      </div>
    </div>
  )
}

export default SelectOptions
