const React = require('react');
const { Box, Text } = require('ink');
const { parse } = require('diff');

const DiffView = ({ diff }) => {
  const hunks = parse(diff);

  return (
    <Box flexDirection="column">
      {hunks.map((hunk, i) => (
        <Box key={i} flexDirection="column">
          <Text color="cyan">{hunk.header}</Text>
          {hunk.lines.map((line, j) => {
            const color = line.startsWith('+')
              ? 'green'
              : line.startsWith('-')
              ? 'red'
              : 'white';
            return (
              <Box key={j}>
                <Text color={color}>{line}</Text>
              </Box>
            );
          })}
        </Box>
      ))}
    </Box>
  );
};

module.exports = DiffView;
