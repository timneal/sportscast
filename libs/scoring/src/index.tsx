import { Heading, HStack, Text, Button, Input, InputGroup, InputLeftAddon, VStack, Card, CardHeader, CardBody, CardFooter } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import ConfettiExplosion, {ConfettiProps} from 'react-confetti-explosion';
import PubNub from 'pubnub';
import { PubNubProvider, usePubNub } from 'pubnub-react';

const pubnub = new PubNub({
  publishKey: import.meta.env.VITE_PN_PUBLISH_KEY,
  subscribeKey: import.meta.env.VITE_PN_SUBSCRIBE_KEY,
  uuid: import.meta.env.VITE_PN_UUID
});

const largeProps: ConfettiProps = {
  force: 0.8,
  duration: 3000,
  particleCount: 300,
  width: 1600,
  colors: ['#041E43', '#1471BF', '#5BB4DC', '#FC027B', '#66D805'],
};

const ScoreboardInner = () =>  {
  const pubnub = usePubNub();
  const [channels] = useState<string[]>(['score-channel']);
  const [eventName, setEventName] = useState<string>('')
  const [maxScore, setMaxScore] = useState<string>('')
  const [teamOneName, setTeamOneName] = useState<string>('')
  const [teamOneScore, setTeamOneScore] = useState<string>('')
  const [teamOneWins, setTeamOneWins] = useState(false);
  const [teamTwoName, setTeamTwoName] = useState<string>('')
  const [teamTwoScore, setTeamTwoScore] = useState<string>('')
  const [teamTwoWins, setTeamTwoWins] = useState(false);


  const handleMessage = (event: PubNub.MessageEvent) => {
    const message = event.message;
    const info = JSON.parse(message);
    setEventName(info.eventName);
    setMaxScore(info.maxScore);
    setTeamOneName(info.teamOne.name);
    setTeamOneScore(info.teamOne.score);
    setTeamTwoName(info.teamTwo.name);
    setTeamTwoScore(info.teamTwo.score);
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

  useEffect(() => {
    if (teamOneScore !== '')
      setTeamOneWins(+teamOneScore >= +maxScore);
    if (teamOneScore !== '')
      setTeamTwoWins(+teamTwoScore >= +maxScore);
  }, [teamOneScore, teamTwoScore, maxScore]);

  const isPopulated = (() => {
    return  eventName !== '' || 
            maxScore !== '' || 
            teamOneName !== '' ||
            teamOneScore !== '' ||
            teamTwoName !== '' ||
            teamTwoScore !== '';
  });

  return (
    <>
    {isPopulated() &&
    <HStack
      background="backgroundTranslucent"
      top="0"
      justify="space-between"
      padding="18px 12px"
      position="absolute"
      right="0"
      spacing="0"
      transition="opacity 0.5s"
      width="100%"
    >
        <Heading test-id="headingName" as="h3" fontSize="18px" fontWeight={600} lineHeight={1.5} backgroundColor={'dolbyPurple.500'} borderRadius={10} padding={2}>
          {eventName}
        </Heading>

        <HStack  backgroundColor={'dolbyPurple.500'} borderRadius={10} padding={1}>
            <Text casing={'uppercase'} color={'white'} padding={2}>{teamOneName}</Text>
            <Text bg={"white"} borderRadius={10} color={'black'} padding={2} width={10} align={'center'}>{teamOneScore}</Text>
            {teamOneWins && <ConfettiExplosion {...largeProps} />}
            <Text bg={"white"} borderRadius={10} color={'black'} padding={2} width={10} align={'center'}>{teamTwoScore}</Text>
            {teamTwoWins && <ConfettiExplosion {...largeProps} />}
            <Text casing={'uppercase'} color={'white'} padding={2}>{teamTwoName}</Text>
        </HStack>
    </HStack>
  };
  </>
  );
}

const Scoreboard = () =>  {
  return (
    <PubNubProvider client={pubnub}>
      <ScoreboardInner/>
    </PubNubProvider>
  );
};

function ScoreCardInner() {
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
          <Button onClick={() => decrementTeamOneScore()}>-</Button>
          <Input 
            value = {teamOneScore}
            onChange={e => setTeamOneScore(e.target.value)}
          />
          <Button onClick={() => incrementTeamOneScore()}>+</Button>
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
          <Button onClick={() => decrementTeamTwoScore()}>-</Button>
          <Input 
            value = {teamTwoScore}
            onChange={e => setTeamTwoScore(e.target.value)}
          />
          <Button onClick={() => incrementTeamTwoScore()}>+</Button>
        </HStack>
      </VStack>
      </CardBody>
      <CardFooter>
      </CardFooter>
    </Card>
  );
}

export const Scorecard = () =>  {
  return (
    <PubNubProvider client={pubnub}>
      <ScoreCardInner/>
    </PubNubProvider>
  );
};

export default Scoreboard;
