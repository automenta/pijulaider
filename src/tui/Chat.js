const React = require('react');
const { Box, Text } = require('ink');
const TextInput = require('ink-text-input').default;
const Mic = require('node-microphone');
const DiffView = require('./DiffView');
const { SpeechClient } = require('@google-cloud/speech');
const { ImgurClient } = require('imgur');

const Chat = ({ messages, onSendMessage, diff }) => {
  const [query, setQuery] = React.useState('');
  const [isRecording, setIsRecording] = React.useState(false);
  const mic = new Mic();
  const speechClient = new SpeechClient();
  const imgurClient = new ImgurClient({
    clientId: process.env.IMGUR_CLIENT_ID,
    clientSecret: process.env.IMGUR_CLIENT_SECRET,
    refreshToken: process.env.IMGUR_REFRESH_TOKEN,
  });

  const handleSubmit = () => {
    onSendMessage(query);
    setQuery('');
  };

  const handleMicClick = async () => {
    if (isRecording) {
      mic.stop();
      setIsRecording(false);
    } else {
      mic.start();
      setIsRecording(true);
      const recognizeStream = speechClient
        .streamingRecognize({
          config: {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            languageCode: 'en-US',
          },
          interimResults: false,
        })
        .on('error', console.error)
        .on('data', (data) => {
          setQuery(data.results[0].alternatives[0].transcript);
          mic.stop();
          setIsRecording(false);
        });

      mic.getAudioStream().pipe(recognizeStream);
    }
  };

  const handleImageClick = async () => {
    const { imagePath } = await inquirer.prompt([
      {
        type: 'input',
        name: 'imagePath',
        message: 'Enter the path to the image:',
      },
    ]);
    if (imagePath) {
      try {
        const response = await imgurClient.upload({
          image: imagePath,
          type: 'file',
        });
        onSendMessage(`/image ${response.data.link}`);
      } catch (error) {
        console.error('Error uploading image to Imgur:', error);
      }
    }
  };

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="green" padding={1} width="100%">
      <Box justifyContent="center" marginBottom={1}>
        <Text bold>PijulAider</Text>
      </Box>
      <Box flexDirection="column" flexGrow={1} marginBottom={1} borderStyle="round" borderColor="gray" padding={1}>
        {messages.map((message, i) => (
          <Box key={i} flexDirection="row">
            <Text bold>{message.sender}: </Text>
            {message.image ? (
              <Text>[Image: {message.image}]</Text>
            ) : (
              <Text>{message.text}</Text>
            )}
          </Box>
        ))}
      </Box>
      {diff && (
        <Box flexDirection="column" borderStyle="round" borderColor="yellow" padding={1} marginBottom={1}>
          <Text bold>Changes:</Text>
          <DiffView diff={diff} />
        </Box>
      )}
      <Box borderStyle="round" borderColor="blue" paddingX={1}>
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
