import { Button, Box, Input, InputGroup, InputLeftAddon, HStack, Heading, Text, VStack, Card, CardHeader, CardBody, CardFooter } from '@chakra-ui/react';
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

function ScoreCard() {
  const pubnub = usePubNub();
  const [channels] = useState<string[]>(['score-channel']);
  const [eventName, setEventName] = useState<string>('Competition Name')
  const [maxScore, setMaxScore] = useState<string>('10')
  const [teamOneName, setTeamOneName] = useState<string>('Home')
  const [teamOneScore, setTeamOneScore] = useState<string>('0')
  const [teamTwoName, setTeamTwoName] = useState<string>('Away')
  const [teamTwoScore, setTeamTwoScore] = useState<string>('0')
  
  useEffect(() => {
    sendScore('send');
  },[
      eventName,
      maxScore,
      teamOneName,
      teamOneScore,
      teamTwoName,
      teamTwoScore
    ]);

  const incrementTeamTwoScore = () => {
    let score = +teamTwoScore + 1;
    if (score > +maxScore)
    {
      score = +maxScore;
    }
    setTeamTwoScore((score).toString());
  };

  const decrementTeamTwoScore = () => {
    let score = +teamTwoScore - 1;
    if (score < 0) {
      score = 0;
    }
    setTeamTwoScore((score).toString());
  };
  
  const incrementTeamOneScore = () => {
    let score = +teamOneScore + 1;
    if (score > +maxScore)
    {
      score = +maxScore;
    }
    setTeamOneScore((score).toString());
  };

  const decrementTeamOneScore = () => {
    let score = +teamOneScore - 1;
    if (score < 0) {
      score = 0;
    }
    setTeamOneScore((score).toString());
  };

  const sendScore = (message: string) => {
    if (message) {
      const score = {
        eventName: eventName,
        maxScore: maxScore,
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
        .then(() => sendScore(''));
    }
  };
  return (
    <Card>
      <CardHeader>
        <Heading color='black'>Sports Cast Score Card</Heading>
      </CardHeader>
      <CardBody>
      <VStack>
      <InputGroup>
        <InputLeftAddon>
          Event Name
        </InputLeftAddon>
          <Input 
            value = {eventName}
            onChange={e => setEventName(e.target.value)}
          />
      </InputGroup>
      <InputGroup>
        <InputLeftAddon>
          Max Score
        </InputLeftAddon>
        <Input 
          value = {maxScore}
          onChange={e => setMaxScore(e.target.value)}
        />
      </InputGroup>
      <InputGroup>
        <InputLeftAddon>
          Team Name
        </InputLeftAddon>
        <Input 
          value = {teamOneName}
          onChange={e => setTeamOneName(e.target.value)}
        />
      </InputGroup>
        <HStack>
          <Button onClick={e => decrementTeamOneScore()}>-</Button>
          <Input 
            value = {teamOneScore}
            onChange={e => setTeamOneScore(e.target.value)}
          />
          <Button onClick={e => incrementTeamOneScore()}>+</Button>
        </HStack>
        <InputGroup>
          <InputLeftAddon>
            Team Name
          </InputLeftAddon>
          <Input 
            value = {teamTwoName}
            onChange={e => setTeamTwoName(e.target.value)} 
          />
        </InputGroup>
        <HStack>
          <Button onClick={e => decrementTeamTwoScore()}>-</Button>
          <Input 
            value = {teamTwoScore}
            onChange={e => setTeamTwoScore(e.target.value)}
          />
          <Button onClick={e => incrementTeamTwoScore()}>+</Button>
        </HStack>
      </VStack>
      </CardBody>
      <CardFooter>
      </CardFooter>
    </Card>
  );
}

export default App;
