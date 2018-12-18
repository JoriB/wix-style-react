import React from 'react';
import PropTypes from 'prop-types';
import style from './DropdownPopover.st.css';

import Popover from '../Popover';
import DropdownLayout from '../DropdownLayout';

class DropdownPopover extends React.PureComponent {
  static displayName = 'DropdownPopover';

  static propTypes = {
    dataHook: PropTypes.string,

    /** An controlled prop to control whether the Popover should be opened*/
    open: PropTypes.bool,
    /** The Popover's placement */
    placement: PropTypes.string, // TODO: set a list of all acceptable placements
    /** Whether to show the Popover's arrow */
    showArrow: PropTypes.bool,
    /** Callback function to be called on outside click */
    onClickOutside: PropTypes.func,
    /** Callback function to be called when selecting an option. It's signature is `onSelect(selectedOption)` */
    onSelect: PropTypes.func,

    options: DropdownLayout.propTypes.options,
    selectedId: DropdownLayout.propTypes.selectedId,
    initialSelectedId: DropdownLayout.propTypes.selectedId,

    /**
     * The target component to be rendered. If a regular node is paseed, it'll be rendered as-is.
     * If a function is passed, it's expected to return a React element. The function accepts an
     * object containing the following properties:
     *
     *  * `open` - will open the Popover
     *  * `close` - will close the Popover
     *  * `toggle` - will toggle the Popover
     *  * `delegateKeyDown` - the underlaying DropdownLayout's keydown handler. It can be called
     *                        inside another keyDown event in order to delegate it.
     *  * `selectedOption` - the currently selected option
     *
     * Refer to the component documentation for more information.
     */
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  };

  static defaultProps = {
    placement: 'bottom',
    showArrow: false,
  };

  _dropdownLayoutRef = null;
  _shouldCloseOnMouseLeave = false;

  state = {
    open: this.props.open || false,
    selectedId: this.props.selectedId || this.props.initialSelectedId || -1,
  };

  /**
   * Return `true` if the `open` prop is being controlled
   */
  _isControllingOpen = () => {
    return typeof this.props.open !== 'undefined';
  };

  /**
   * Return `true` if the selection behaviour is being controlled
   */
  _isControllingSelection = () => {
    return (
      typeof this.props.selectedId !== 'undefined' &&
      typeof this.props.onSelect !== 'undefined'
    );
  };

  _open = () => {
    !this._isControllingOpen() && this.setState({ open: true });
  };

  _close = e => {
    if (this._isControllingOpen()) {
      return;
    }

    // If called within a `mouseleave` event on the target element, we would like to close the
    // popover only on the popover's `mouseleave` event
    if (e && e.type === 'mouseleave') {
      // We're not using `setState` since we don't want to wait for the next render
      this._shouldCloseOnMouseLeave = true;
    } else {
      this.setState({ open: false });
    }
  };

  _toggle = () => {
    !this._isControllingOpen() &&
      this.setState(({ open }) => ({
        open: !open,
      }));
  };

  _handleClickOutside = () => {
    const { onClickOutside } = this.props;

    this._close();
    onClickOutside && onClickOutside();
  };

  _handlePopoverMouseLeave = () => {
    if (this._shouldCloseOnMouseLeave) {
      this._shouldCloseOnMouseLeave = false;

      this.setState({
        open: false,
      });
    }
  };

  _handleSelect = selectedOption => {
    const newState = {};

    if (!this._isControllingOpen()) {
      newState.open = false;
    }

    if (!this._isControllingSelection()) {
      newState.selectedId = selectedOption.id;
    }

    this.setState(newState, () => {
      const { onSelect } = this.props;
      onSelect && onSelect(selectedOption);
    });
  };

  _handleClose = () => {
    if (this.state.open) {
      this._close();
    }
  };

  _getSelectedOption = selectedId => {
    return this.props.options.find(({ id }) => id === selectedId) || null;
  };

  /**
   * Determine if a certain key should open the DropdownLayout
   */
  _isOpenKey = key => {
    return ['Enter', 'Spacebar', ' ', 'ArrowDown'].includes(key);
  };

  /**
   * A common `keydown` event that can be used for the target elements. It will automatically
   * delegate the event to the underlaying <DropdownLayout/>, and will determine when to open the
   * dropdown depending on the pressed key.
   */
  _handleKeyDown = e => {
    if (this._isControllingOpen()) {
      return;
    }

    const isHandledByDropdownLayout = this._delegateKeyDown(e);

    if (!isHandledByDropdownLayout) {
      if (this._isOpenKey(e.key)) {
        this._open();
        e.preventDefault();
      }
    }
  };

  /*
   * Delegate the event to the DropdownLayout. It'll handle the navigation, option selection and
   * closing of the dropdown.
   */
  _delegateKeyDown = e => {
    if (!this._dropdownLayoutRef) {
      return false;
    }

    return this._dropdownLayoutRef._onKeyDown(e);
  };

  componentWillReceiveProps(nextProps) {
    // Keep internal state updated if needed
    if (this._isControllingOpen() && this.props.open !== nextProps.open) {
      this.setState({ open: nextProps.open });
    }

    if (
      this._isControllingSelection() &&
      this.props.selectedId !== nextProps.selectedId
    ) {
      this.setState({ selectedId: nextProps.selectedId });
    }
  }

  renderChildren() {
    const { children } = this.props;
    const { selectedId } = this.state;

    if (!children) {
      return null;
    }

    return React.isValidElement(children)
      ? children // Returning the children as is when using in controlled mode
      : children({
          open: this._open,
          close: this._close,
          toggle: this._toggle,

          delegateKeyDown: this._delegateKeyDown,

          selectedOption: this._getSelectedOption(selectedId),
        });
  }

  render() {
    const { dataHook, placement, showArrow, options } = this.props;
    const { open, selectedId } = this.state;

    return (
      <Popover
        dataHook={dataHook}
        shown={open}
        placement={placement}
        showArrow={showArrow}
        onKeyDown={this._handleKeyDown}
        onMouseLeave={this._handlePopoverMouseLeave}
        onClickOutside={this._handleClickOutside}
        {...style('root', {}, this.props)}
      >
        <Popover.Element>{this.renderChildren()}</Popover.Element>

        <Popover.Content>
          <DropdownLayout
            dataHook="dropdown-popover-dropdownlayout"
            ref={r => (this._dropdownLayoutRef = r)}
            selectedId={selectedId}
            options={options}
            onSelect={this._handleSelect}
            onClose={this._handleClose}
            inContainer
            visible
          />
        </Popover.Content>
      </Popover>
    );
  }
}

export default DropdownPopover;
