const React = require('react');
const { Box } = require('ink');
const { default: SyntaxHighlighter } = require('react-syntax-highlighter');
const { docco } = require('react-syntax-highlighter/dist/cjs/styles/hljs');

const DiffView = ({ diff }) => {
  return (
    <Box flexDirection="column">
      <SyntaxHighlighter language="diff" style={docco}>
        {diff}
      </SyntaxHighlighter>
    </Box>
  );
};

module.exports = DiffView;
