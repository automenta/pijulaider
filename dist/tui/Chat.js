import React, { useState, useEffect } from 'react';
import { Box, Text, Newline } from 'ink';
const Chat = ({ messages, onSendMessage, diff }) => {
    const [query, setQuery] = useState('');
    const [TextInput, setTextInput] = useState(null);
    useEffect(() => {
        import('ink-text-input').then((module) => {
            setTextInput(() => module.default);
        });
    }, []);
    const handleSubmit = () => {
        onSendMessage(query);
        setQuery('');
    };
    return (React.createElement(Box, { flexDirection: "column" },
        React.createElement(Box, { flexDirection: "column", flexGrow: 1 }, messages.map((message, i) => (React.createElement(Box, { key: i },
            React.createElement(Text, { color: message.sender === 'user' ? 'green' : 'blue' },
                message.sender,
                ":",
                ' '),
            React.createElement(Text, null, message.text))))),
        diff && (React.createElement(Box, { flexDirection: "column", borderStyle: "round", borderColor: "gray" },
            React.createElement(Text, null, "Changes:"),
            React.createElement(Text, null, diff))),
        React.createElement(Newline, null),
        React.createElement(Box, null,
            React.createElement(Text, null, "You: "),
            TextInput && React.createElement(TextInput, { value: query, onChange: setQuery, onSubmit: handleSubmit }))));
};
export { Chat };
