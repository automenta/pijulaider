const React = require('react');
const { Box, Text, Newline } = require('ink');
const TextInput = require('ink-text-input').default;

const Chat = ({ messages, onSendMessage }) => {
  const [query, setQuery] = React.useState('');

  const handleSubmit = () => {
    onSendMessage(query);
    setQuery('');
  };

  return (
    <Box flexDirection="column">
      <Box flexDirection="column">
        {messages.map((message, i) => (
          <Box key={i}>
            <Text color={message.sender === 'user' ? 'green' : 'blue'}>
              {message.sender}:{' '}
            </Text>
            <Text>{message.text}</Text>
          </Box>
        ))}
      </Box>
      <Newline />
      <Box>
        <Text>You: </Text>
        <TextInput value={query} onChange={setQuery} onSubmit={handleSubmit} />
      </Box>
    </Box>
  );
};

module.exports = Chat;
