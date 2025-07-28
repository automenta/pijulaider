const React = require('react');
const { Box, Text } = require('ink');

const DiffView = ({ diff }) => {
  const lines = diff.split('\n');
  return (
    <Box flexDirection="column">
      {lines.map((line, i) => {
        let color = 'white';
        if (line.startsWith('+')) {
          color = 'green';
        } else if (line.startsWith('-')) {
          color = 'red';
        }
        return (
          <Text key={i} color={color}>
            {line}
          </Text>
        );
      })}
    </Box>
  );
};

module.exports = DiffView;
