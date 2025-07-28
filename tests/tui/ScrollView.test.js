const React = require('react');
const { render } = require('ink-testing-library');
const ScrollView = require('../../src/tui/ScrollView');
const { Text } = require('ink');

describe('ScrollView', () => {
  it('should render its children', () => {
    const { lastFrame, unmount } = render(
      <ScrollView>
        <Text>Child 1</Text>
        <Text>Child 2</Text>
      </ScrollView>
    );
    expect(lastFrame()).toContain('Child 1');
    expect(lastFrame()).toContain('Child 2');
    unmount();
  });
});
