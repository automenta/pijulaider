const React = require('react');
const { Box, Text, Newline } = require('ink');
const TextInput = require('ink-text-input').default;
const Mic = require('node-microphone');
const FilePicker = require('file-picker');
const DiffView = require('./DiffView');

const Chat = ({ messages, onSendMessage, diff }) => {
  const [query, setQuery] = React.useState('');
  const [isRecording, setIsRecording] = React.useState(false);
  const mic = new Mic();

  const handleSubmit = () => {
    onSendMessage(query);
    setQuery('');
  };

  const handleMicClick = () => {
    onSendMessage('Voice input is not implemented yet.');
  };

  const handleImageClick = () => {
    onSendMessage('Image input is not implemented yet.');
  };

  return (
    <Box flexDirection="column" height="100%">
      <Box flexDirection="column" flexGrow={1} overflowY="auto">
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
        <Box
          flexDirection="column"
          borderStyle="round"
          borderColor="gray"
          maxHeight="30%"
          overflowY="auto"
        >
          <Text>Changes:</Text>
          <DiffView diff={diff} />
        </Box>
      )}
      <Newline />
      <Box>
        <Text>You: </Text>
        <TextInput value={query} onChange={setQuery} onSubmit={handleSubmit} />
        <Box marginLeft={1} onClick={handleMicClick}>
          <Text>{isRecording ? '🛑' : '🎤'}</Text>
        </Box>
        <Box marginLeft={1} onClick={handleImageClick}>
          <Text>🖼️</Text>
        </Box>
      </Box>
    </Box>
  );
};

module.exports = Chat;
