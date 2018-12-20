import React from 'react';
import CardGalleryItem from '.';
import { createUniDriverFactory } from 'wix-ui-test-utils/uni-driver-factory';
import cardGalleryItemPrivateDriverFactory from './CardGalleryItem.driver.private';

describe('CardGalleryItem', () => {
  const createDriver = createUniDriverFactory(
    cardGalleryItemPrivateDriverFactory,
  );

  it('should exist', async () => {
    const driver = createDriver(<CardGalleryItem />);

    expect(await driver.exists()).toBeTruthy();
  });

  it('should render title', async () => {
    const driver = createDriver(<CardGalleryItem title="Card" />);

    expect(await driver.getTitle()).toBe('Card');
  });

  it('should render subtitle', async () => {
    const driver = createDriver(<CardGalleryItem subtitle="Subtitle" />);

    expect(await driver.getSubtitle()).toBe('Subtitle');
  });

  it('should set background image', async () => {
    const driver = createDriver(
      <CardGalleryItem backgroundImageUrl="http://test.com/img.png" />,
    );

    expect(await driver.getBackgroundImageUrl()).toBe(
      'http://test.com/img.png',
    );
  });

  it('should not render hovered content', async () => {
    const driver = createDriver(<CardGalleryItem />);

    expect(await driver.isHoveredContentPresent()).toBeFalsy();
  });

  describe('on hover', () => {
    it('should render hovered content', async () => {
      const driver = createDriver(<CardGalleryItem />);

      await driver.hover();

      expect(await driver.isHoveredContentPresent()).toBeTruthy();
    });

    it('on click on card should call once only primary action', async () => {
      const primaryActionOnClick = jest.fn();
      const secondaryActionOnClick = jest.fn();
      const driver = createDriver(
        <CardGalleryItem
          primaryActionProps={{
            onClick: primaryActionOnClick,
          }}
          secondaryActionProps={{
            onClick: secondaryActionOnClick,
          }}
        />,
      );

      await driver.click();

      expect(primaryActionOnClick).toHaveBeenCalledTimes(1);
      expect(secondaryActionOnClick).not.toHaveBeenCalled();
    });

    it('should render primary button label', async () => {
      const driver = createDriver(
        <CardGalleryItem
          primaryActionProps={{
            label: 'Primary',
          }}
        />,
      );

      await driver.hover();

      expect(await driver.getPrimaryActionLabel()).toBe('Primary');
    });

    it('on click on primary button should call once only primary action', async () => {
      const primaryActionOnClick = jest.fn();
      const secondaryActionOnClick = jest.fn();
      const driver = createDriver(
        <CardGalleryItem
          primaryActionProps={{
            onClick: primaryActionOnClick,
          }}
          secondaryActionProps={{
            onClick: secondaryActionOnClick,
          }}
        />,
      );

      await driver.hover();
      await driver.clickOnPrimaryAction();

      expect(primaryActionOnClick).toHaveBeenCalledTimes(1);
      expect(secondaryActionOnClick).not.toHaveBeenCalled();
    });

    it('should render secondary button label', async () => {
      const driver = createDriver(
        <CardGalleryItem
          secondaryActionProps={{
            label: 'Secondary',
          }}
        />,
      );

      await driver.hover();

      expect(await driver.getSecondaryActionLabel()).toBe('Secondary');
    });

    it('on click on primary button should call once only secondary action', async () => {
      const primaryActionOnClick = jest.fn();
      const secondaryActionOnClick = jest.fn();
      const driver = createDriver(
        <CardGalleryItem
          primaryActionProps={{
            onClick: primaryActionOnClick,
          }}
          secondaryActionProps={{
            onClick: secondaryActionOnClick,
          }}
        />,
      );

      await driver.hover();
      await driver.clickOnSecondaryAction();

      expect(secondaryActionOnClick).toHaveBeenCalledTimes(1);
      expect(primaryActionOnClick).not.toHaveBeenCalled();
    });
  });
});