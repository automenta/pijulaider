const React = require('react');
const { Box, Text } = require('ink');
const TextInput = require('ink-text-input').default;
const SelectInput = require('ink-select-input').default;
const Mic = require('node-microphone');
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
    if (isRecording) {
      mic.stop();
    } else {
      mic.start();
      mic.on('data', (data) => {
        // TODO: Send audio data to speech-to-text service
        // For now, we'll just log it to the console
        console.log('Received audio data:', data);
      });
    }
    setIsRecording(!isRecording);
  };

  const handleImageClick = () => {
    onSendMessage('/image');
  };

  const items = messages.map((message, i) => ({
    label: `${message.sender}: ${message.text}`,
    value: i,
  }));

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="gray" padding={1}>
      <Box flexDirection="column" flexGrow={1} marginBottom={1}>
        <SelectInput items={items} />
      </Box>
      {diff && (
        <Box flexDirection="column" borderStyle="round" borderColor="gray" padding={1} marginBottom={1}>
          <Text>Changes:</Text>
          <DiffView diff={diff} />
        </Box>
      )}
      <Box borderStyle="round" borderColor="gray" paddingX={1}>
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
