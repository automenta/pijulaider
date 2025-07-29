const React = require('react');

module.exports = {
  render: (tree) => ({
    lastFrame: () => {
      // This is a very basic mock. It just renders the children to a string.
      const recurse = (node) => {
        if (!node) return '';
        if (typeof node === 'string') return node;
        if (Array.isArray(node)) return node.map(recurse).join('');
        if (node.props && node.props.children) {
          if (node.type.name === 'SyntaxHighlighter') {
            return recurse(node.props.children);
          }
          return recurse(node.props.children);
        }
        return '';
      };
      return recurse(tree);
    },
    unmount: () => {},
  }),
  Box: ({ children }) => React.createElement('Box', null, children),
  Text: ({ children }) => React.createElement('Text', null, children),
  Newline: () => React.createElement('Newline'),
  useInput: (fn, options) => {},
  useApp: () => ({ exit: () => {} }),
};
