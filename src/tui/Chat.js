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
      setIsRecording(false);
    } else {
      mic.start();
      setIsRecording(true);
      mic.on('data', (data) => {
        // Mock speech-to-text service
        const transcribedText = 'This is a mock transcription.';
        setQuery(transcribedText);
        mic.stop();
        setIsRecording(false);
      });
    }
  };

  const handleImageClick = () => {
    onSendMessage('/image');
  };

  const items = messages.map((message, i) => {
    if (message.image) {
      return {
        label: `${message.sender}: [Image: ${message.image}]`,
        value: i,
      };
    }
    return {
      label: `${message.sender}: ${message.text}`,
      value: i,
    };
  });

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
