import React from 'react';
import { Box, useInput } from 'ink';

const ScrollView = ({ children }) => {
  const [scrollTop, setScrollTop] = React.useState(0);

  useInput((input, key) => {
    if (key.upArrow) {
      setScrollTop(Math.max(0, scrollTop - 1));
    }

    if (key.downArrow) {
      setScrollTop(scrollTop + 1);
    }
  });

  return (
    <Box flexDirection="column" overflow="hidden" flexGrow={1}>
      <Box flexDirection="column" marginTop={-scrollTop}>
        {children}
      </Box>
    </Box>
  );
};

export default ScrollView;
