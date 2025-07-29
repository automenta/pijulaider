import React from 'react';
import { Box } from 'ink';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const DiffView = ({ diff }) => {
  return (
    <Box flexDirection="column">
      <SyntaxHighlighter language="diff" style={docco}>
        {diff}
      </SyntaxHighlighter>
    </Box>
  );
};

export default DiffView;
