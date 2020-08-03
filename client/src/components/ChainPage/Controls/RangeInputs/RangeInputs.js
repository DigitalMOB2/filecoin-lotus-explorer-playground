import React, { useState, useEffect } from 'react'
import { RangeInputs } from './range-inputs.styled'

const RangeInputsComponent = ({ rangeIntervals, onChange }) => {
  const numberOfEpochsToShow = 10;
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

    onChange([Number(min), Number(max)])
  }

  const updateMinMax = (max) => {
    let min = max - numberOfEpochsToShow;
    if (min < 0) min = 0;
    setMax(max);
    setMin(min);
  }

  return (
    <RangeInputs>
      <div>
        <input value={min} />
        <span>Min</span>
      </div>
      <div>
        <input value={max} onKeyPress={onKeyPress} onBlur={onSubmit} onChange={(e) => updateMinMax(e.target.value) } />
        <span>Max</span>
      </div>
    </RangeInputs>
  )
}

export { RangeInputsComponent as RangeInputs }
