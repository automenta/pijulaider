const React = require('react');
const { render } = require('ink-testing-library');
const DiffView = require('../../src/tui/DiffView');

describe('DiffView', () => {
  it('should render a diff', () => {
    const diff = `
--- a/file.js
+++ b/file.js
@@ -1,1 +1,1 @@
-console.log("Hello, World!");
+console.log("Hello, PijulAider!");
`;
    const { lastFrame } = render(<DiffView diff={diff} />);
    expect(lastFrame()).toContain('Hello, PijulAider!');
  });
});
