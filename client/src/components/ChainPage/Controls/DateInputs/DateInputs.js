import React, { useState, useEffect } from 'react';
import { DatePicker } from '../../../shared/DatePicker'

const DateInputsComponent = ({ filter, maxTimeDiff, onChange }) => {
  const [startDate, setStartDate] = useState(filter.startDate);
  const [endDate, setEndDate] = useState(filter.endDate);

  const maxTimeDiffInMs = maxTimeDiff * 60 * 60 * 1000;
  const timeInterval = 30; // in minutes

  useEffect(() => {
    setStartDate(filter.startDate);
    setEndDate(filter.endDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter.startDate, filter.endDate]);

  const onSubmit = () => {
    if (startDate && endDate && (+startDate !== +filter.startDate || +endDate !== +filter.endDate)) {
      if (startDate.getTime() > endDate.getTime()) {
        let temp = startDate;
        setStartDate(endDate);
        setEndDate(temp);
      }
      onChange(startDate, endDate);
    }
  };

  const handlerBlur = () => {
    onSubmit();
  };

  const onKeyDown = (e) => {
    if (e.which === 13) {
      if (startDate && !endDate) {
        setEndDate(new Date(startDate.getTime() + maxTimeDiffInMs));
      }
      onSubmit();
    }
  };


  return (
    <div onBlur={handlerBlur}>
      <DatePicker
        selected={startDate}
        onChange={(date) => setStartDate(date)}
        placeholderText="Start date, mm/dd/yyyy"
        dateFormat="MM/dd/yyyy, h:mm aa"
        showTimeInput
        onKeyDown={onKeyDown}
        timeIntervals={timeInterval}
      />
      <DatePicker
        selected={endDate}
        onChange={(date) => setEndDate(date)}
        placeholderText={startDate ? 'End date, mm/dd/yyyy' : 'Select Start date'}
        dateFormat="MM/dd/yyyy, h:mm aa"
        showTimeInput
        disabled={!startDate}
        minDate={startDate}
        maxDate={+startDate ? new Date(+startDate + maxTimeDiffInMs) : null}
        onKeyDown={onKeyDown}
        timeIntervals={timeInterval}
      />
    </div>
  )
};

export { DateInputsComponent as DateInputs };
