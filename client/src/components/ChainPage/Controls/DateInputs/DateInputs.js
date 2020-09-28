import React, { useState, useEffect, useCallback } from 'react';
import { DatePicker } from '../../../shared/DatePicker';
import debounce from 'lodash/debounce';
import { DateTime } from 'luxon';

const DateInputsComponent = ({ filter, maxTimeDiff, onChange }) => {
  const [startDate, setStartDate] = useState(filter.startDate);
  const [endDate, setEndDate] = useState(filter.endDate);
  const [calendarIsOpen, setCalendarIsOpen] = useState(false);
  const [validator, setValidator] = useState({ isSameDates: false, isValidDates: false, isDatesChanged: false });

  useEffect(() => {
    setStartDate(filter.startDate);
    setEndDate(filter.endDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [+filter.startDate, +filter.endDate]);

  useEffect(() => {
    const isSameDates = DateTime.fromJSDate(startDate).equals(DateTime.fromJSDate(endDate));
    const isValidDates = DateTime.fromJSDate(startDate).isValid && DateTime.fromJSDate(endDate).isValid;
    const isDatesChanged = !DateTime.fromJSDate(filter.startDate).equals(DateTime.fromJSDate(startDate))
      || !DateTime.fromJSDate(filter.endDate).equals(DateTime.fromJSDate(endDate));

    setValidator({ isSameDates, isValidDates, isDatesChanged });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [+startDate, +endDate]);

  const onSubmit = () => {
    const { isSameDates, isValidDates, isDatesChanged } = validator;

    if (!calendarIsOpen && !isSameDates && isValidDates && isDatesChanged) {
      if (+startDate > +endDate) {
        let temp = startDate;
        setStartDate(endDate);
        setEndDate(temp);
      }
      onChange(startDate, endDate);
    }
  };

  const debounced = useCallback(debounce(onSubmit, 1000), [+startDate, +endDate, calendarIsOpen]);

  useEffect(() => {
    debounced();

    return debounced.cancel;
  }, [debounced, calendarIsOpen]);

  return (
    <div>
      <DatePicker
        selected={startDate}
        value={startDate}
        onChange={(date) => setStartDate(date)}
        placeholderText="Start date, mm/dd/yyyy"
        dateFormat="MM/dd/yyyy, h:mm aa"
        showTimeInput
        onCalendarClose={() => setCalendarIsOpen(false)}
        onCalendarOpen={() => setCalendarIsOpen(true)}
        selectsStart
        startDate={startDate}
        endDate={endDate}
      />
      <DatePicker
        selected={endDate}
        value={endDate}
        onChange={(date) => setEndDate(date)}
        placeholderText={DateTime.fromJSDate(startDate).isValid ? 'End date, mm/dd/yyyy' : 'Select Start date'}
        dateFormat="MM/dd/yyyy, h:mm aa"
        showTimeInput
        disabled={!DateTime.fromJSDate(startDate).isValid}
        onCalendarClose={() => setCalendarIsOpen(false)}
        onCalendarOpen={() => setCalendarIsOpen(true)}
        minDate={startDate}
        maxDate={DateTime.fromJSDate(startDate).plus({ hours: maxTimeDiff }).toJSDate()}
        selectsEnd
        startDate={startDate}
        endDate={endDate}
      />
    </div>
  )
};

export { DateInputsComponent as DateInputs };
