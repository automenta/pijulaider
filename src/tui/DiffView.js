const React = require('react');
const { Box, Text } = require('ink');
const { parseTwoWayDiff } = require('diff');

const DiffView = ({ diff }) => {
  const diffLines = diff.split('\n');
  const structuredDiff = parseTwoWayDiff(diff);

  return (
    <Box flexDirection="column">
      {structuredDiff.map((part, i) => {
        const color = part.added ? 'green' : part.removed ? 'red' : 'white';
        return (
          <Box key={i}>
            <Text color={color}>{part.value}</Text>
          </Box>
        );
      })}
    </Box>
  );
};

module.exports = DiffView;
