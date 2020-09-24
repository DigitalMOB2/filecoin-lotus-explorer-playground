import React, { useState, useEffect } from 'react'
import { RangeInputs } from './range-inputs.styled'
import { constants } from '../../../../utils/constants'

const RangeInputsComponent = ({ minValue, maxValue, rangeIntervals, onChange }) => {
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
    e.preventDefault();
    const value = Number(e.target.value);

    if (!Number.isInteger(value)) {
      return;
    }

    if (value + constants.maxBlockRange < max) {
      setMax(Math.min(maxValue, value + constants.maxBlockRange));
    }

    if (value >= max) {
      setMax(Math.min(maxValue, value + constants.initialBlockRangeLimit));
    }

    setMin(Math.max(minValue, Math.min(maxValue - constants.initialBlockRangeLimit, value)));
  }

  const updateMax = (e) => {
    e.preventDefault();
    const value = Number(e.target.value);

    if (!Number.isInteger(value)) {
      return;
    }

    if (min + constants.maxBlockRange < value) {
      setMin(Math.max(minValue, Math.min(maxValue - constants.initialBlockRangeLimit,  value - constants.maxBlockRange)));
    }
    if (value <= min) {
      setMin(Math.max(minValue, value - constants.initialBlockRangeLimit));
    }

    setMax(Math.min(maxValue, value));
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
