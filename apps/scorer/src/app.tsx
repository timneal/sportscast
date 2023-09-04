import { Button, Box, Input, HStack, Heading, Text, VStack, Card, CardHeader, CardBody, CardFooter } from '@chakra-ui/react';
import React, { useState, useEffect } from 'react';
import PubNub from 'pubnub';
import { PubNubProvider, usePubNub } from 'pubnub-react';

import './styles/app.css';

const pubnub = new PubNub({
  publishKey: 'pub-c-b14caa5c-c35d-4da7-bed8-3fd3564f11bb',
  subscribeKey: 'sub-c-59bf0b71-9aa4-4168-9e57-139036b8bfd3',
  uuid: 'lijojatis'
});


function App() {
  return (
    <VStack background="background" height="100%" padding="24px" spacing="24px" width="100%">
      <VStack spacing="16px" width="100%">
        <PubNubProvider client={pubnub}>
          <ScoreCard />
        </PubNubProvider>
      </VStack>
      <Box bottom="5px" left="5px" position="fixed" test-id="appVersion" paddingTop="10px">
        <Text fontSize="12px">Version: {__APP_VERSION__}</Text>
      </Box>
    </VStack>
  );
}

const defaultScore = {
  eventName: 'My Event',
  teamOne: {
    name: 'Team 1',
    score: '0'
  },
  teamTwo: {
    name: 'Team 2',
    score: '0'
  }
};

function ScoreCard() {
  const pubnub = usePubNub();
  const [channels] = useState<string[]>(['awesome-channel']);
  const [eventName, setEventName] = useState<string>(defaultScore.eventName)
  const [teamOneName, setTeamOneName] = useState<string>(defaultScore.teamOne.name)
  const [teamOneScore, setTeamOneScore] = useState<string>(defaultScore.teamOne.score)
  const [teamTwoName, setTeamTwoName] = useState<string>(defaultScore.teamTwo.name)
  const [teamTwoScore, setTeamTwoScore] = useState<string>(defaultScore.teamTwo.score)
  
  const updateScore = (message: string) => {
    if (message) {
      const score = {
        eventName: eventName,
        teamOne: {
          name: teamOneName,
          score: teamOneScore
        },
        teamTwo: {
          name: teamTwoName,
          score: teamTwoScore
        }
      };
      message = JSON.stringify(score);
      pubnub
        .publish({ channel: channels[0], message })
        .then(() => updateScore(''));
    }
  };

  return (
    <Card>
      <CardHeader>
        <Heading>Sports Cast Score Card</Heading>
      </CardHeader>
      <CardBody>
      <VStack>
      <Input onChange={e => setEventName(e.target.value)} placeholder='Enter Event Name'/>
      <HStack>
        <Input onChange={e => setTeamOneName(e.target.value)} placeholder='Team Name'/>
        <Input onChange={e => setTeamOneScore(e.target.value)} placeholder='Team Score'/>
      </HStack>
      <HStack>
        <Input onChange={e => setTeamTwoName(e.target.value)} placeholder='Team Name'/>
        <Input onChange={e => setTeamTwoScore(e.target.value)} placeholder='Team Score'/>
      </HStack>
      </VStack>
      </CardBody>
      <CardFooter>
        <Button onClick={e => updateScore('send')}>Submit</Button>
      </CardFooter>
    </Card>
  );
}

export default App;
