import React from 'react';
import MultiSelect from 'wix-style-react/MultiSelect';
import styles from './ExampleStandard.scss';

export const options = [
  { value: 'Alabama', id: 'Alabama', tag: { label: 'Alabama' } },
  { value: 'Alaska', id: 'Alaska' },
  {
    value: (
      <div className={styles.option}>
        <div>Arizona</div>
        <div className={styles.thumb} />
      </div>
    ),
    id: 'Arizona',
    tag: { label: 'Arizona', thumb: <div className={styles.thumb} /> },
  },
  { value: 'Arkansas', id: 'Arkansas' },
  { value: 'California', id: 'California' },
  { value: 'California2', id: 'California2' },
  { value: 'California3', id: 'California3' },
  { value: 'California4', id: 'California4' },
  { value: 'California5', id: 'California5' },
  { value: 'California6', id: 'California6' },
  { value: 'California7', id: 'California7' },
  { id: 'Divider', value: '-' },
  { value: 'Two words', id: 'Two words' },
];

export const valueParser = option =>
  option.tag ? option.tag.label : option.value;

class ExampleReorderable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tags: [],
      options,
      inputValue: '',
    };
  }

  getValue = option =>
    typeof option.value === 'string'
      ? option.value
      : option.value.props.children[0].props.children;

  handleOnSelect = tags =>
    Array.isArray(tags)
      ? this.setState({ tags: [...this.state.tags, ...tags] })
      : this.setState({ tags: [...this.state.tags, tags] });

  handleOnRemoveTag = tagId =>
    this.setState({
      tags: this.state.tags.filter(currTag => currTag.id !== tagId),
    });

  handleOnChange = event => this.setState({ inputValue: event.target.value });

  predicate = option =>
    this.getValue(option)
      .toLowerCase()
      .includes(this.state.inputValue.toLowerCase());

  render() {
    const { tags } = this.state;
    return (
      <div>
        <div className={styles.main}>
          <MultiSelect
            dataHook="multi-select-reorderable"
            tags={this.state.tags}
            onSelect={this.handleOnSelect}
            onRemoveTag={this.handleOnRemoveTag}
            onReorder={({ addedIndex, removedIndex }) => {
              const nextTags = tags.slice();
              nextTags.splice(
                addedIndex,
                0,
                ...nextTags.splice(removedIndex, 1),
              );
              this.setState({
                tags: nextTags,
              });
            }}
            onChange={this.handleOnChange}
            onManuallyInput={() => {}}
            options={this.state.options}
            value={this.state.inputValue}
            predicate={this.predicate}
            valueParser={valueParser}
          />
        </div>
      </div>
    );
  }
}

export default ExampleReorderable;
