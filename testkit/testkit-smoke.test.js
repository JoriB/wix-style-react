import React from 'react';
import { mount } from 'enzyme';
import { render, cleanup } from 'react-testing-library';
import path from 'path';

import {
  isTestkitExists,
  isEnzymeTestkitExists,
  isUniEnzymeTestkitExists,
  isUniTestkitExists,
} from '../test/utils/testkit-sanity';
import importAllComponents from '../test/utils/import-all-components';

import * as reactTestUtilsTestkitFactories from './index';
import * as enzymeTestkitFactories from './enzyme';

import Popover from '../src/Popover';

/**
 * The following list ignores specified components and skip testkit tests for them.
 * Reason is that some of them are not meant to have testkits, some are failing due to missing configuration (e.g.
 * required initial props) or other reasons.
 *
 * Goal should be to reduce this list to minimum, or, ideally, get rid of it entirely.
 */
const FAILING_COMPONENTS = [
  'AutoCompleteComposite',
  'BadgeSelectItemBuilder',
  'ButtonLayout',
  'ButtonWithOptions',
  'CalendarPanel',
  'Card', // Component has no testkit
  'ColorPicker',
  'Composite',
  'DatePicker',
  'DragAndDrop',
  'DragDropContextProvider',
  'DropdownComposite',
  'EndorseContentLayout',
  'FloatingHelper',
  'FullTextView',
  'GoogleAddressInput',
  'GoogleAddressInputWithLabel',
  'Grid', // Component has no testkit
  'HBox', // Component has no testkit
  'RichTextAreaComposite',
  'IconWithOptions',
  'Layout',
  'MessageBox',
  // 'Modal',
  'ModalSelectorLayout',
  'MultiSelect',
  'MultiSelectCheckbox',
  'MultiSelectComposite',
  'Notification',
  'Page',
  'PageHeader',
  'PopoverMenuItem',
  'Range',
  'SideMenuDrill',
  'TableToolbar',
  'Tabs',
  'TextArea',
  'TextField',
  'VBox', // Component has no testkit
  'Collapse',
];

/**
 * The following object allows to set which testkits should be asserted as well as provide any required props
 *
 * If component is not set here, then enzyme and vanilla testkits will be checked as default.
 *
 * COMPONENTS = {
 *   [componentName]: {
 *     drivers: ['vanilla', 'enzyme'],
 *     props: {
 *       // any required props
 *     }
 *   }
 * }
 */
const COMPONENTS = {
  TextButton: {
    unidriver: true,
  },
  IconButton: {
    unidriver: true,
  },
  CloseButton: {
    unidriver: true,
  },
  RichTextArea: {
    beforeAllHook: () => (window.getSelection = () => ({})),
  },
  Tag: {
    props: {
      useOldMargins: false,
      id: 'hello',
      children: 'a',
    },
  },
  ImageViewer: {
    props: {
      imageUrl: '',
    },
  },
  FormField: {
    props: {
      children: <div />,
    },
  },
  BadgeSelect: {
    props: {
      options: [{ id: '0', skin: 'general', text: 'general' }],
      selectedId: '0',
    },
  },
  Breadcrumbs: {
    props: {
      items: [{ id: 0, value: 'Option 1' }, { id: 1, value: 'Option 2' }],
    },
  },
  Calendar: {
    props: {
      onChange: () => {},
    },
  },
  DataTable: {
    props: {
      data: [{ a: 'value 1', b: 'value 2' }],
      columns: [{ title: 'A', render: row => row.a }],
    },
  },
  Slider: {
    props: {
      onChange: () => {},
    },
  },
  Selector: {
    props: {
      id: 1,
      title: 'title',
    },
  },
  StatsWidget: {
    props: {
      title: 'test title',
    },
  },
  Table: {
    props: {
      data: [{ a: 'value 1', b: 'value 2' }],
      columns: [{ title: 'A', render: row => row.a }],
    },
  },
  Tooltip: {
    props: {
      content: "I'm the content",
    },
  },
  Modal: {
    props: {
      isOpen: false,
      contentLabel: 'modal_12345678',
    },
  },
  Popover: {
    props: {
      children: [
        <Popover.Element>
          <div>I am the trigger!</div>
        </Popover.Element>,
        <Popover.Content>
          <div>I am the content!</div>
        </Popover.Content>,
      ],
    },
  },
};

const cwd = path.resolve(__dirname, '..', 'src');
const lowerFirst = a =>
  a
    .charAt(0)
    .toLowerCase()
    .concat(a.slice(1));

const AllComponents = importAllComponents({
  cwd,
  ignore: FAILING_COMPONENTS,
});

const handleBeforeAllHook = (beforeTask, afterTask) => {
  beforeAll(async () => beforeTask && (await beforeTask()));
  afterAll(async () => afterTask && (await afterTask));
};

const handleUniDriverConfig = config => {
  DRIVER_ASSERTS.enzymeUni(config);
  DRIVER_ASSERTS.vanillaUni(config);
};

const handleDriverConfig = config => {
  DRIVER_ASSERTS.enzyme(config);
  DRIVER_ASSERTS.vanilla(config);
};

const handleNoConfig = config => {
  DRIVER_ASSERTS.enzyme(config);
  DRIVER_ASSERTS.vanilla(config);
};

const DRIVER_ASSERTS = {
  enzyme: ({ name, component, props, beforeAllHook, afterAllHook }) => {
    describe('Enzyme testkits', () => {
      handleBeforeAllHook(beforeAllHook, afterAllHook);
      it(`${name} should have enzyme testkit`, () => {
        expect(
          isEnzymeTestkitExists(
            React.createElement(component, props),
            enzymeTestkitFactories[`${lowerFirst(name)}TestkitFactory`],
            mount,
          ),
        );
      });
    });
  },

  vanilla: ({ name, component, props, beforeAllHook, afterAllHook }) => {
    describe('ReactTestUtils testkits', () => {
      handleBeforeAllHook(beforeAllHook, afterAllHook);
      it(`${name} should have ReactTestUtils testkit`, () => {
        expect(
          isTestkitExists(
            React.createElement(component, props),
            reactTestUtilsTestkitFactories[`${lowerFirst(name)}TestkitFactory`],
          ),
        );
      });
    });
    describe('ReactTestUtils update dataHook', () => {
      handleBeforeAllHook(beforeAllHook, afterAllHook);
      /* eslint-disable jest/no-disabled-tests */
      xit(`${name} should have an updated dataHook`, () => {
        /* eslint-enable jest/no-disabled-tests */
        const hook1 = 'my-data-hook-1';
        const hook2 = 'my-data-hook-2';
        const { rerender, container } = render(
          React.createElement(component, { ...props, dataHook: hook1 }),
        );
        expect(
          !!container.querySelector(`[data-hook="${hook1}"]`),
        ).toBeTruthy();

        rerender(React.createElement(component, { ...props, dataHook: hook2 }));
        expect(
          !!container.querySelector(`[data-hook="${hook2}"]`),
        ).toBeTruthy();
        cleanup();
      });
    });
  },
  enzymeUni: ({ name, component, props, beforeAllHook, afterAllHook }) => {
    describe('Enzyme unidriver testkits', () => {
      handleBeforeAllHook(beforeAllHook, afterAllHook);
      it(`${name} should have enzyme testkit`, () => {
        expect(
          isUniEnzymeTestkitExists(
            React.createElement(component, props),
            enzymeTestkitFactories[`${lowerFirst(name)}TestkitFactory`],
            mount,
          ),
        );
      });
    });
  },
  vanillaUni: ({ name, component, props, beforeAllHook, afterAllHook }) => {
    describe('ReactTestUtils unidriver testkits', () => {
      handleBeforeAllHook(beforeAllHook, afterAllHook);
      it(`${name} should have ReactTestUtils testkit`, () => {
        expect(
          isUniTestkitExists(
            React.createElement(component, props),
            reactTestUtilsTestkitFactories[`${lowerFirst(name)}TestkitFactory`],
          ),
        );
      });
    });
  },
};

Object.entries(AllComponents).forEach(([name, component]) => {
  const driverConfig = COMPONENTS[name];

  const config = {
    beforeAllHook: () => {},
    ...driverConfig,
    name,
    component,
  };

  // handle unidriver
  driverConfig && driverConfig.unidriver && handleUniDriverConfig(config);
  // handle simple driverConfig
  driverConfig && !driverConfig.unidriver && handleDriverConfig(config);

  // handle no-config
  !driverConfig && handleNoConfig({ name, component });
});
