import React, { useState, useEffect } from 'react'
import { RangeInputs } from './range-inputs.styled'
import { constants } from '../../../../utils/constants'

const RangeInputsComponent = ({ rangeIntervals, onChange }) => {
  const [min, setMin] = useState(rangeIntervals[0])
  const [max, setMax] = useState(rangeIntervals[1])

  useEffect(() => {
    setMin(rangeIntervals[0])
    setMax(rangeIntervals[1])

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, rangeIntervals)

  const onKeyPress = (e) => {
    if (e.which === 13) {
      onSubmit()
    }
  }

  const onSubmit = () => {
    if (min === rangeIntervals[0] && max === rangeIntervals[1]) return

    onChange([min, max])
  }

  const updateMin = (e) => {
    const min = Number(e.target.value);
    if (min + constants.initialBlockRangeLimit > max) {
      setMax(min + constants.initialBlockRangeLimit);
    }

    setMin(min);
  }

  const updateMax = (e) => {
    const max = Number(e.target.value);
    if (max - constants.initialBlockRangeLimit > min) {
      setMin(max - constants.initialBlockRangeLimit);
    }

    setMax(max);
  }

  return (
    <RangeInputs>
      <div>
        <input
          value={min}
          onKeyPress={onKeyPress}
          onBlur={onSubmit}
          onChange={updateMin}
        />
        <span>Min</span>
      </div>
      <div>
        <input
          value={max}
          onKeyPress={onKeyPress}
          onBlur={onSubmit}
          onChange={updateMax}
        />
        <span>Max</span>
      </div>
    </RangeInputs>
  )
}

export { RangeInputsComponent as RangeInputs }
