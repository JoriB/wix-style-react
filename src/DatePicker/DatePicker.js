import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Popper from 'popper.js';
import DayPickerInput from 'react-day-picker/DayPickerInput';

import isSameDay from 'date-fns/is_same_day';
import setYear from 'date-fns/set_year';
import setMonth from 'date-fns/set_month';
import setDate from 'date-fns/set_date';

import WixComponent from '../BaseComponents/WixComponent';
import CalendarIcon from '../new-icons/Date';
import {formatDate} from './LocaleUtils';

import styles from './DatePicker.scss';
import arrowStyles from './arrow.scss';
import Input from '../Input';
import Calendar from './Calendar';

/**
 * DatePicker component
 *
 * ### Keyboard support
 * * `Left`: Move to the previous day.
 * * `Right`: Move to the next day.
 * * `Up`: Move to the previous week.
 * * `Down`: Move to the next week.
 * * `PgUp`: Move to the previous month.
 * * `PgDn`: Move to the next month.
 * * `Home`: Move to the previous year.
 * * `End`: Move to the next year.
 * * `Enter`/`Esc`/`Tab`: close the calendar. (`Enter` & `Esc` calls `preventDefault`)
 *
 */
export default class DatePicker extends WixComponent {
  static displayName = 'DatePicker';

  static propTypes = {
    /** Can provide Input with your custom props. If you don't need a custom input element, and only want to pass props to the Input, then use inputProps prop. I think this is not in use outside of WSR, and can be deprecated. */
    customInput: PropTypes.node,

    /** Properties appended to the default Input component or the custom Input component. */
    inputProps: PropTypes.object,

    /** Custom date format */
    dateFormat: PropTypes.string,

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
        'da'
      ]),
      PropTypes.shape({
        distanceInWords: PropTypes.object,
        format: PropTypes.object
      })
    ]),

    /** Is the DatePicker disabled */
    disabled: PropTypes.bool,

    /** Past dates are unselectable */
    excludePastDates: PropTypes.bool,

    /** Only the truthy dates are selectable */
    filterDate: PropTypes.func,

    /** dataHook for the DatePicker's Input */
    inputDataHook: PropTypes.string,

    /** calendarDataHook for the DatePicker's calendar view */
    calendarDataHook: PropTypes.string,

    /** Called upon every value change */
    onChange: PropTypes.func.isRequired,

    /** placeholder of the Input */
    placeholderText: PropTypes.string,

    /** RTL mode */
    rtl: PropTypes.bool,

    /** Display a selectable yearDropdown */
    showYearDropdown: PropTypes.bool,

    /** Display a selectable monthDropdown */
    showMonthDropdown: PropTypes.bool,

    /** The selected date */
    value: PropTypes.object,

    /** should the calendar close on day selection */
    shouldCloseOnSelect: PropTypes.bool,

    /** controls the whether the calendar will be visible or not */
    isOpen: PropTypes.bool,

    /** will show exclamation icon when true **/
    error: PropTypes.bool,

    /** will display message when hovering error icon **/
    errorMessage: PropTypes.node,

    /** set desired width of DatePicker input */
    width: PropTypes.number
  };

  static defaultProps = {
    locale: 'en',
    dateFormat: 'MM/DD/YYYY',
    filterDate: () => true,
    shouldCloseOnSelect: true,
    rtl: false,
    width: 150
  };

  constructor(props) {
    super(props);

    this.state = {
      isOpen: props.isOpen || false
    };
  }

  componentDidMount() {
    super.componentDidMount();

    this._popper = new Popper(this.inputRef, this.calendarRef, {
      placement: 'top-start'
    });
  }

  componentWillUnmount() {
    this._popper.destroy();
    super.componentWillUnmount();
  }

  openCalendar = () => {
    if (!this.state.isOpen) {
      this.setState(
        {
          isOpen: true,
          value: this.props.value || new Date()
        },
        () => this._popper.scheduleUpdate()
      );
    }
  };

  closeCalendar = () => this.setState({isOpen: false});

  _saveNewValue = (value, modifiers = {}) => {
    if (modifiers.disabled) {
      return;
    }

    const isChanged = !isSameDay(value, this.props.value);

    if (isChanged) {
      const newValue = [
        [value.getFullYear(), setYear],
        [value.getMonth(), setMonth],
        [value.getDate(), setDate]
      ].reduce((value, [datePart, setter]) => setter(value, datePart), this.props.value);

      this.setState({value: newValue}, () => this.props.onChange(newValue));
    }

    this.props.shouldCloseOnSelect && this.closeCalendar();
  };

  _handleKeyDown = event => {
    // TODO: dirty for now
    // tab key should move focus so can't preventDefault
    if (event.keyCode !== 9) {
      event.preventDefault();
    }

    if (!this.state.isOpen) {
      this.openCalendar();
    }

    // keyHandler(this.state.value);
  };

  onClickOutside() {
    this.closeCalendar();
  }

  render() {
    const {
      inputDataHook,
      calendarDataHook,
      dateFormat,
      locale,
      disabled,
      placeholderText,
      readOnly,
      value: initialValue,
      error,
      errorMessage,
      customInput,
      width,
      inputProps,
      showMonthDropdown,
      showYearDropdown,
      filterDate,
      excludePastDates,
      rtl
    } = this.props;

    const {isOpen} = this.state;

    const _inputProps = {
      dataHook: inputDataHook,
      value: (initialValue && formatDate(initialValue, dateFormat, locale)) || '',
      onInputClicked: this.openCalendar,
      disabled,
      readOnly,
      placeholder: placeholderText,
      prefix: (
        <span className={styles.icon}>
          <CalendarIcon/>
        </span>
      ),
      onFocus: this.openCalendar,
      onKeyDown: this._handleKeyDown,
      error,
      errorMessage,
      ...(customInput ? customInput.props : {}),
      ...inputProps
    };

    const calendarProps = {
      locale,
      showMonthDropdown,
      showYearDropdown,
      filterDate,
      excludePastDates,
      rtl,
      onChange: this._saveNewValue,
      onClose: this.closeCalendar
    };

    return (
      <div style={{width}} className={styles.root}>
        <div ref={ref => (this.inputRef = ref)}>
          <DayPickerInput
            component={() => React.cloneElement(customInput || <Input/>, _inputProps)}
            keepFocus={false}
            />
        </div>

        <div
          ref={ref => (this.calendarRef = ref)}
          data-hook={calendarDataHook}
          className={classNames(styles.calendarRoot, {
            [arrowStyles.root]: isOpen
          })}
          >

          <Calendar {...calendarProps} visible={isOpen} value={this.state.value}/>
        </div>
      </div>
    );
  }
}
