import React, { useState, useEffect } from 'react';
import PubNub from 'pubnub';
import { PubNubProvider, usePubNub } from 'pubnub-react';

const pubnub = new PubNub({
  publishKey: 'pub-c-b14caa5c-c35d-4da7-bed8-3fd3564f11bb',
  subscribeKey: 'sub-c-59bf0b71-9aa4-4168-9e57-139036b8bfd3',
  uuid: 'lijojatis'
});

function App() {
  return (
    <PubNubProvider client={pubnub}>
      <Chat />
    </PubNubProvider>
  );
}

function Chat() {
  const pubnub = usePubNub();
  const [channels] = useState<string[]>(['awesome-channel']);
  const [messages, addMessage] = useState<string[]>([]);
  const [message, setMessage] = useState<string>('');
  
  const handleMessage = (event: PubNub.MessageEvent) => {
    const message = event.message;
    addMessage(messages => [...messages, message.text]);
  };

  const sendMessage = (message: string) => {
    if (message) {
      pubnub
        .publish({ channel: channels[0], message })
        .then(() => setMessage(''));
    }
  };

  useEffect(() => {
    const listenerParams = { message: handleMessage }
    pubnub.addListener(listenerParams);
    pubnub.subscribe({ channels });
    return () => {
        pubnub.unsubscribe({ channels })
        pubnub.removeListener(listenerParams)
    }
  }, [pubnub, channels]);

  return (
    <div style={pageStyles}>
      <div style={chatStyles}>
        <div style={headerStyles}>React Chat Example</div>
        <div style={listStyles}>
          {messages.map((message, index) => {
            return (
              <div key={`message-${index}`} style={messageStyles}>
                {message}
              </div>
            );
          })}
        </div>
        <div style={footerStyles}>
          <input
            type="text"
            style={inputStyles}
            placeholder="Type your message"
            value={message}
            onKeyPress={e => {
              if (e.key !== 'Enter') return;
              sendMessage(message);
            }}
            onChange={e => setMessage(e.target.value)}
          />
          <button
            style={buttonStyles}
            onClick={e => {
              e.preventDefault();
              sendMessage(message);
            }}
          >
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
}

const pageStyles = {
  alignItems: 'center',
  background: '#282c34',
  display: 'flex',
  justifyContent: 'center',
  minHeight: '100vh',
};

const chatStyles = {
  display: 'flex',
  //flexDirection: 'column',
  height: '50vh',
  width: '50%',
};

const headerStyles = {
  background: '#323742',
  color: 'white',
  fontSize: '1.4rem',
  padding: '10px 15px',
};

const listStyles = {
  alignItems: 'flex-start',
  backgroundColor: 'white',
  display: 'flex',
  //flexDirection: 'column',
  flexGrow: 1,
  overflow: 'auto',
  padding: '10px',
};

const messageStyles = {
  backgroundColor: '#eee',
  borderRadius: '5px',
  color: '#333',
  fontSize: '1.1rem',
  margin: '5px',
  padding: '8px 15px',
};

const footerStyles = {
  display: 'flex',
};

const inputStyles = {
  flexGrow: 1,
  fontSize: '1.1rem',
  padding: '10px 15px',
};

const buttonStyles = {
  fontSize: '1.1rem',
  padding: '10px 15px',
};

export default App;
