import styles from './Calendar.scss';
import React from 'react';
import PropTypes from 'prop-types';
import DayPicker from 'react-day-picker/DayPicker';
import addMonths from 'date-fns/add_months';
import startOfMonth from 'date-fns/start_of_month';
import classNames from 'classnames';
import parse from 'date-fns/parse';

import WixComponent from '../BaseComponents/WixComponent';
import localeUtilsFactory from '../LocaleUtils';
import DatePickerHead from './DatePickerHead';

export default class Calendar extends WixComponent {
  static displayName = 'Calendar';

  static defaultProps = {
    locale: 'en',
    className: '',
    filterDate: () => true,
    shouldCloseOnSelect: true,
    onClose: () => {},
  };

  constructor(props) {
    super(props);

    const initialMonth = Calendar.getNextMonth(props.value);
    this.state = {
      month: initialMonth || new Date(),
    };
  }

  static dateToMonth(date) {
    return date ? date.getFullYear() * 100 + date.getMonth() : null;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      const month = Calendar.getNextMonth(nextProps.value, this.state.month);
      if (month) {
        this.setState({ month });
      }
    }
  }

  static renderDay(day, modifiers) {
    const relevantModifiers = ['start', 'end', 'selected'];
    for (const modifier of relevantModifiers) {
      if (modifier in modifiers) {
        return (
          <div
            className={styles.dayCircle}
            data-date={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`}
          >
            {day.getDate()}
          </div>
        );
      }
    }

    return (
      <div
        data-date={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`}
      >
        {day.getDate()}
      </div>
    );
  }

  _setMonth = month => {
    this.setState({ month });
  };

  _handleDayClick = (value, modifiers = {}) => {
    const propsValue = this.props.value || {};
    const { onChange, shouldCloseOnSelect } = this.props;

    if (this.props.selectionMode === 'range') {
      if (
        (!propsValue.from && !propsValue.to) ||
        (propsValue.from && propsValue.to)
      ) {
        onChange({ from: value }, modifiers);
      } else {
        const anchor = propsValue.from || propsValue.to;
        const newVal =
          anchor < value
            ? { from: anchor, to: value }
            : { from: value, to: anchor };

        onChange(newVal, modifiers);
        shouldCloseOnSelect && this.props.onClose();
      }
    } else {
      onChange(value, modifiers);
      shouldCloseOnSelect && this.props.onClose();
    }
  };

  static optionalParse = dateOrString =>
    typeof dateOrString === 'string' ? parse(dateOrString) : dateOrString;

  static parseValue = value => {
    if (!value) {
      return new Date();
    }
    if (typeof value === 'string') {
      return parse(value);
    } else if (value instanceof Date) {
      return value;
    } else {
      return {
        from: Calendar.optionalParse(value.from),
        to: Calendar.optionalParse(value.to),
      };
    }
  };

  static isSingleDay(value) {
    return value instanceof Date;
  }

  static getNextMonth = (nextPropsValue, currentMonthDate) => {
    const nextValue = Calendar.parseValue(nextPropsValue);
    const currentMonth = Calendar.dateToMonth(currentMonthDate);

    if (Calendar.isSingleDay(nextValue)) {
      if (currentMonth !== Calendar.dateToMonth(nextValue)) {
        return nextValue;
      }
    } else {
      const fromMonth = Calendar.dateToMonth(nextValue.from);
      const toMonth = Calendar.dateToMonth(nextValue.to);
      if (fromMonth && (!currentMonth || currentMonth < fromMonth)) {
        return nextValue.from;
      } else if (toMonth && (!currentMonth || currentMonth > toMonth)) {
        return nextValue.to;
      }
    }

    return null;
  };

  _getSelectedDays(value) {
    const { from, to } = value || {};
    if (from && to) {
      return { from: from, to: to };
    } else if (from) {
      return { after: prevDay(from) };
    } else if (to) {
      return { before: nextDay(to) };
    } else {
      // Single day OR empty value
      return value;
    }
  }

  _createCaptionElement = month => {
    const { locale, showMonthDropdown, showYearDropdown } = this.props;

    const localeUtils = localeUtilsFactory(locale);

    return (
      <DatePickerHead
        {...{
          date: month,
          showYearDropdown,
          showMonthDropdown,
          localeUtils,
          onChange: this._setMonth,
          onLeftArrowClick: () =>
            this._setMonth(startOfMonth(addMonths(month, -1))),
          onRightArrowClick: () =>
            this._setMonth(startOfMonth(addMonths(month, 1))),
        }}
      />
    );
  };

  _createDayPickerProps = () => {
    const { locale, filterDate, excludePastDates, twoMonths } = this.props;

    const value = Calendar.parseValue(this.props.value);

    const month = this.state.month;
    const localeUtils = localeUtilsFactory(locale);
    const { from, to } = value || {};
    const singleDay = !from && !to && value;

    const firstOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const lastOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const captionElement = this._createCaptionElement(month);
    const selectedDays = this._getSelectedDays(value);

    return {
      disabledDays: excludePastDates
        ? { before: new Date() }
        : date => !filterDate(date),
      initialMonth: month,
      initialYear: month,
      selectedDays,
      month,
      year: month,
      firstDayOfWeek: 1,
      locale: typeof locale === 'string' ? locale : '',
      fixedWeeks: true,
      onKeyDown: this._handleKeyDown,
      onDayClick: this._handleDayClick,
      localeUtils,
      navbarElement: () => null,
      captionElement,
      onDayKeyDown: this._handleDayKeyDown,
      numberOfMonths: twoMonths ? 2 : 1,
      className: twoMonths ? 'DayPicker--TwoMonths' : '',
      modifiers: { start: from, end: to, firstOfMonth, lastOfMonth, singleDay },
      renderDay: Calendar.renderDay,
    };
  };

  _handleKeyDown = event => {
    const keyHandler = this.keyHandlers[event.keyCode];

    keyHandler && keyHandler();
  };

  keyHandlers = {
    // escape
    27: this.props.onClose,

    // tab
    9: this.props.onClose,
  };

  _focusSelectedDay = dayPickerRef => {
    if (dayPickerRef) {
      this.dayPickerRef = dayPickerRef;
      const selectedDay = this.dayPickerRef.dayPicker.querySelector(
        '.DayPicker-Day--selected',
      );

      if (selectedDay) {
        selectedDay.classList.add('DayPicker-Day--unfocused');
        selectedDay.focus();
      }
    }
  };

  _handleDayKeyDown = () => {
    const unfocusedDay = this.dayPickerRef.dayPicker.querySelector(
      '.DayPicker-Day--unfocused',
    );

    if (unfocusedDay) {
      unfocusedDay.classList.remove('DayPicker-Day--unfocused');
    }
  };

  render() {
    return (
      <div className={classNames(styles.calendar, this.props.className)}>
        <DayPicker
          ref={this._focusSelectedDay}
          {...this._createDayPickerProps()}
        />
      </div>
    );
  }
}

Calendar.propTypes = {
  /** Use 2 months layout */
  /* TODO WIP, uncomment after feature done
  twoMonths: PropTypes.bool,
  */

  className: PropTypes.string,

  /** Callback function called with a Date or a Range whenever the user selects a day in the calendar */
  onChange: PropTypes.func.isRequired,

  /** Callback function called whenever user press escape or click outside of the element */
  onClose: PropTypes.func,

  /** Past dates are unselectable */
  excludePastDates: PropTypes.bool,

  /** Only the truthy dates are selectable */
  filterDate: PropTypes.func,

  /** The selected date */
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
    PropTypes.shape({
      from: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      to: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    }),
  ]),

  /** Whether the user should be able to select a date range, or just a single day */
  selectionMode: PropTypes.oneOf(['day', 'range']),

  /** Display a selectable yearDropdown */
  showYearDropdown: PropTypes.bool,

  /** Display a selectable monthDropdown */
  showMonthDropdown: PropTypes.bool,

  /** should the calendar close on day selection */
  shouldCloseOnSelect: PropTypes.bool,

  /** DatePicker instance locale */
  locale: PropTypes.oneOfType([
    PropTypes.oneOf([
      'en',
      'es',
      'pt',
      'fr',
      'de',
      'pl',
      'it',
      'ru',
      'ja',
      'ko',
      'tr',
      'sv',
      'no',
      'nl',
      'da',
    ]),
    PropTypes.shape({
      distanceInWords: PropTypes.object,
      format: PropTypes.object,
    }),
  ]),
};

function nextDay(date) {
  const day = new Date(date);
  day.setDate(day.getDate() + 1);
  return day;
}

function prevDay(date) {
  const day = new Date(date);
  day.setDate(day.getDate() - 1);
  return day;
}
