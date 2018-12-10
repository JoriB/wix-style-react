import React from 'react';

import { createDriverFactory } from 'wix-ui-test-utils/driver-factory';
import breadcrumbsDriverFactory from './Breadcrumbs.private.driver';

import Breadcrumbs from './Breadcrumbs';

const createDriver = createDriverFactory(breadcrumbsDriverFactory);
const items = [{ id: 0, value: 'Option 1' }, { id: 1, value: 'Option 2' }];
let onClick;

describe('Breadcrumbs', () => {
  beforeEach(() => {
    onClick = jest.fn();
  });

  it('should have correct text on each breadcrumb', () => {
    const driver = createDriver(<Breadcrumbs {...{ onClick, items }} />);
    expect(driver.breadcrumbsLength()).toBe(items.length);
    expect(driver.breadcrumbContentAt(0)).toBe(items[0].value);
    expect(driver.breadcrumbContentAt(1)).toBe(items[1].value);
  });

  it('should call onClick callback on click with correct item', () => {
    const driver = createDriver(<Breadcrumbs {...{ onClick, items }} />);
    const itemIndex = 1;

    driver.clickBreadcrumbAt(itemIndex);
    expect(onClick).toBeCalledWith({
      id: items[itemIndex].id,
      value: 'Option 2',
    });
  });

  it('should get correct size from props', () => {
    const size = 'large';
    const driver = createDriver(<Breadcrumbs {...{ onClick, items, size }} />);
    expect(driver.isLarge()).toBe(true);
  });

  it('should use medium size as default', () => {
    const driver = createDriver(<Breadcrumbs {...{ onClick, items }} />);
    expect(driver.isMedium()).toBe(true);
  });

  it('should get theme from props', () => {
    const theme = 'onWhiteBackground';
    const driver = createDriver(<Breadcrumbs {...{ onClick, items, theme }} />);
    expect(driver.isOnWhiteBackground()).toBe(true);
  });

  it('should use default theme gray background', () => {
    const driver = createDriver(<Breadcrumbs {...{ onClick, items }} />);
    expect(driver.isOnGrayBackground()).toBe(true);
  });

  it('should get active id from props and have correct class', () => {
    const itemIndex = 1;
    const driver = createDriver(
      <Breadcrumbs {...{ onClick, items, activeId: items[itemIndex].id }} />,
    );
    expect(driver.getActiveItemId()).toBe(itemIndex);
  });

  it('should return null if not exists active id', () => {
    const driver = createDriver(<Breadcrumbs {...{ onClick, items }} />);
    expect(driver.getActiveItemId()).toBe(null);
  });

  describe('item with link attribute', () => {
    const linkItems = [
      { id: 0, value: 'Option 1', link: '//www.wix.com' },
      { id: 1, value: 'Option 2', link: '//www.facebook.com' },
    ];

    it('should not have links if link attribute is not given', () => {
      const driver = createDriver(<Breadcrumbs {...{ items }} />);
      expect(driver.isActiveLinkAt(0)).toBe(false);
      expect(driver.isActiveLinkAt(1)).toBe(false);
    });

    it('should be a link if no activeId is given', () => {
      const driver = createDriver(<Breadcrumbs {...{ items: linkItems }} />);
      expect(driver.isActiveLinkAt(0)).toBe(true);
      expect(driver.isActiveLinkAt(1)).toBe(true);
    });

    it('should not be a link if it is the item with activeId', () => {
      const driver = createDriver(
        <Breadcrumbs {...{ items: linkItems, activeId: 0 }} />,
      );
      expect(driver.isActiveLinkAt(0)).toBe(false);
      expect(driver.isActiveLinkAt(1)).toBe(true);
    });
  });

  describe('customElement attribute', () => {
    const customItems = [
      {
        id: 0,
        value: 'Option 1',
        customElement: <a href="//www.wix.com">Option 1</a>,
      },
      {
        id: 1,
        value: 'Option 2',
        customElement: <a href="//www.facebook.com">Option 2</a>,
      },
    ];

    const customItemsWithLinks = [
      {
        id: 0,
        value: 'value',
        customElement: <a href="//www.wix.com">Custom value</a>,
        link: 'www.bla.com',
      },
    ];

    it('should render the customElement when given', () => {
      const driver = createDriver(<Breadcrumbs {...{ items: customItems }} />);

      expect(driver.breadcrumbsLength()).toBe(customItems.length);
      expect(driver.breadcrumbContentAt(0)).toBe(customItems[0].value);
      expect(driver.breadcrumbContentAt(1)).toBe(customItems[1].value);
    });

    it('should render the customElement even if link attribute is given', () => {
      const driver = createDriver(
        <Breadcrumbs {...{ items: customItemsWithLinks }} />,
      );

      expect(driver.breadcrumbsLength()).toBe(customItemsWithLinks.length);
      expect(driver.breadcrumbContentAt(0)).toBe('Custom value');
    });

    it('should render the value attribute of the item when this is the activeId', () => {
      const driver = createDriver(
        <Breadcrumbs {...{ items: customItemsWithLinks, activeId: 0 }} />,
      );

      expect(driver.breadcrumbContentAt(0)).toBe(customItemsWithLinks[0].value);
    });
  });

  describe('given only one item', () => {
    it('should take full width', () => {
      const driver = createDriver(
        <Breadcrumbs {...{ items: [{ id: 0, value: 'Option 1' }] }} />,
      );
      expect(driver.isItemFullWidthAt(0)).toBe(true);
    });
  });
});
