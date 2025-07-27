const React = require('react');
const { Box, Text, Newline } = require('ink');
const TextInput = require('ink-text-input').default;

const Chat = ({ messages, onSendMessage, diff }) => {
  const [query, setQuery] = React.useState('');

  const handleSubmit = () => {
    onSendMessage(query);
    setQuery('');
  };

  return (
    <Box flexDirection="column">
      <Box flexDirection="column" flexGrow={1}>
        {messages.map((message, i) => (
          <Box key={i}>
            <Text color={message.sender === 'user' ? 'green' : 'blue'}>
              {message.sender}:{' '}
            </Text>
            <Text>{message.text}</Text>
          </Box>
        ))}
      </Box>
      {diff && (
        <Box flexDirection="column" borderStyle="round" borderColor="gray">
          <Text>Changes:</Text>
          <Text>{diff}</Text>
        </Box>
      )}
      <Newline />
      <Box>
        <Text>You: </Text>
        <TextInput value={query} onChange={setQuery} onSubmit={handleSubmit} />
        <Box marginLeft={1}>
          <Text>🎤</Text>
        </Box>
        <Box marginLeft={1}>
          <Text>🖼️</Text>
        </Box>
      </Box>
    </Box>
  );
};

module.exports = Chat;
