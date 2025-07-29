const React = require('react');
const { render, Text } = require('ink');
const ScrollView = require('../../src/tui/ScrollView');

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
