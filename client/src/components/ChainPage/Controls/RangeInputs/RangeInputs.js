import React, { useState, useEffect } from 'react';
import { RangeInputs } from './range-inputs.styled';

const RangeInputsComponent = ({ range, minBlock, maxBlock, onChange }) => {
  const [min, setMin] = useState(range[0]);
  const [max, setMax] = useState(range[1]);

  useEffect(() => {
    setMin(range[0]);
    setMax(range[1]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, range);

  const onSubmit = () => {
    if (min !== range[0] || max !== range[1]) {
      onChange([min,  max])
    }
  };

  const handlerBlur = () => {
    onSubmit();
  };

  const onKeyPress = (e) => {
    if (e.which === 13) {
      onSubmit();
    }
  };

  const handlerChange = (key, event) => {
    event.preventDefault();
    const value = Number(event.target.value);

    if (Number.isInteger(value) && value >= 0) {
      if (key === 'min') {
        setMin(Math.max(minBlock, value));
      }
      if (key === 'max') {
        setMax(Math.min(maxBlock, value));
      }
    }
  };

  return (
    <RangeInputs onBlur={handlerBlur}>
      <div>
        <input
          value={min}
          onKeyPress={onKeyPress}
          onChange={(e) => handlerChange('min', e)}
        />
        <span>Min</span>
      </div>
      <div>
        <input
          value={max}
          onKeyPress={onKeyPress}
          onChange={(e) => handlerChange('max', e)}
        />
        <span>Max</span>
      </div>
    </RangeInputs>
  )
};

export { RangeInputsComponent as RangeInputs };
