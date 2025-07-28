const React = require('react');
const { Box, Text } = require('ink');
const TextInput = require('ink-text-input').default;
const Mic = require('node-microphone');
const DiffView = require('./DiffView');
const ScrollView = require('./ScrollView');

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

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="gray" padding={1} width="100%" height="100%">
      <ScrollView>
        {messages.map((message, i) => (
          <Box key={i} flexDirection="column" marginBottom={1}>
            <Text bold>{message.sender}:</Text>
            {message.image ? <Text>[Image: {message.image}]</Text> : <Text>{message.text}</Text>}
          </Box>
        ))}
      </ScrollView>
      {diff && (
        <Box flexDirection="column" borderStyle="round" borderColor="gray" padding={1} marginY={1}>
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
