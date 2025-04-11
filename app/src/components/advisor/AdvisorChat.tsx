import React from 'react';
import styled from 'styled-components';
import { TextField, Button, Fieldset, Select } from 'react95';

interface AdvisorChatProps {
  messages: Array<{
    sender: 'user' | 'advisor';
    text: string;
    timestamp: string;
  }>;
  onSendMessage: (message: string) => void;
}

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 10px;
  border: 2px inset #c0c0c0;
  background-color: white;
  padding: 10px;
`;

const MessageBubble = styled.div<{ isAdvisor: boolean }>`
  max-width: 80%;
  margin: 5px;
  padding: 8px 12px;
  border-radius: 4px;
  align-self: ${props => props.isAdvisor ? 'flex-start' : 'flex-end'};
  background-color: ${props => props.isAdvisor ? '#c0c0c0' : '#0000aa'};
  color: ${props => props.isAdvisor ? 'black' : 'white'};
  font-family: 'MS Sans Serif';
  font-size: 14px;
  position: relative;
  margin-bottom: 15px;
`;

const MessageTimestamp = styled.div`
  font-size: 10px;
  color: #666;
  position: absolute;
  bottom: -15px;
  right: 5px;
`;

const InputContainer = styled.div`
  display: flex;
  margin-top: 10px;
`;

const StyledTextField = styled(TextField)`
  flex: 1;
  margin-right: 10px;
`;

const AdvisorChat: React.FC<AdvisorChatProps> = ({ messages, onSendMessage }) => {
  const [inputMessage, setInputMessage] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      onSendMessage(inputMessage);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <ChatContainer>
      <Fieldset label="Y2K Investment Advisor">
        <MessagesContainer>
          {messages.map((message, index) => (
            <MessageBubble key={index} isAdvisor={message.sender === 'advisor'}>
              {message.text}
              <MessageTimestamp>{message.timestamp}</MessageTimestamp>
            </MessageBubble>
          ))}
          <div ref={messagesEndRef} />
        </MessagesContainer>
      </Fieldset>
      <InputContainer>
        <StyledTextField
          placeholder="Ask your investment advisor..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          fullWidth
        />
        <Button onClick={handleSendMessage} disabled={!inputMessage.trim()}>
          Send
        </Button>
      </InputContainer>
    </ChatContainer>
  );
};

export default AdvisorChat;
